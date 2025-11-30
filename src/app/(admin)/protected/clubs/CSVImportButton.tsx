"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useState } from "react";

type CSVClub = {
  club_name: string;
  city: string;
  state: string;
  website_url?: string;
  ages?: string;
  competition_level?: string;
  about?: string;
  founded?: string;
};

export default function CSVImportButton({ onImportComplete }: { onImportComplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVClub[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  function parseCSV(text: string): CSVClub[] {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['club_name', 'city', 'state'];
    const missing = requiredHeaders.filter(h => !headers.includes(h));
    if (missing.length > 0) {
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }

    const clubs: CSVClub[] = [];
    const validationErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const club: any = {};

      headers.forEach((header, index) => {
        if (values[index]) {
          club[header] = values[index];
        }
      });

      // Validate required fields
      if (!club.club_name) {
        validationErrors.push(`Row ${i}: Missing club_name`);
        continue;
      }
      if (!club.city) {
        validationErrors.push(`Row ${i}: Missing city`);
        continue;
      }
      if (!club.state) {
        validationErrors.push(`Row ${i}: Missing state`);
        continue;
      }

      clubs.push(club);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    return clubs;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setImportResults(null);

    try {
      const text = await selectedFile.text();
      const clubs = parseCSV(text);
      setPreviewData(clubs);
    } catch (error: any) {
      alert(`Error parsing CSV: ${error.message}`);
      setFile(null);
    }
  }

  async function handleImport() {
    if (!previewData.length) return;

    setIsImporting(true);
    const supabase = getSupabaseBrowserClient();

    let successCount = 0;
    let failCount = 0;

    for (const club of previewData) {
      const { error } = await supabase
        .from("clubs")
        .insert({
          club_name: club.club_name,
          city: club.city,
          state: club.state,
          website_url: club.website_url || '',
          ages: club.ages || '',
          competition_level: club.competition_level || '',
          about: club.about || null,
          founded: club.founded || null,
        });

      if (error) {
        console.error(`Failed to import ${club.club_name}:`, error);
        failCount++;
      } else {
        successCount++;
      }
    }

    setIsImporting(false);
    setImportResults({ success: successCount, failed: failCount });

    if (successCount > 0 && onImportComplete) {
      setTimeout(() => {
        onImportComplete();
      }, 2000);
    }
  }

  function resetModal() {
    setIsOpen(false);
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setImportResults(null);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        📥 Import CSV
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Import Clubs from CSV</h2>
              <p className="text-sm text-gray-600 mt-2">
                Upload a CSV file with columns: club_name, city, state (required), plus optional: website_url, ages, competition_level, about, founded
              </p>
            </div>

            <div className="p-6">
              {/* File upload */}
              {!file && !importResults && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] transition"
                  >
                    Choose CSV File
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    or drag and drop a .csv file here
                  </p>
                </div>
              )}

              {/* Validation errors */}
              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Validation Warnings:</h3>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {errors.slice(0, 10).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {errors.length > 10 && (
                      <li>... and {errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview table */}
              {previewData.length > 0 && !importResults && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Preview ({previewData.length} clubs will be imported)
                  </h3>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Club Name</th>
                          <th className="px-4 py-2 text-left">City</th>
                          <th className="px-4 py-2 text-left">State</th>
                          <th className="px-4 py-2 text-left">Website</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {previewData.slice(0, 50).map((club, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{club.club_name}</td>
                            <td className="px-4 py-2">{club.city}</td>
                            <td className="px-4 py-2">{club.state}</td>
                            <td className="px-4 py-2">{club.website_url || '-'}</td>
                          </tr>
                        ))}
                        {previewData.length > 50 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-center text-gray-500 text-xs">
                              ... and {previewData.length - 50} more clubs
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import results */}
              {importResults && (
                <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Import Complete!</h3>
                  <p className="text-green-700">
                    ✓ Successfully imported {importResults.success} clubs
                  </p>
                  {importResults.failed > 0 && (
                    <p className="text-orange-700 mt-2">
                      ⚠ Failed to import {importResults.failed} clubs (see console for details)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={resetModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm font-medium"
              >
                {importResults ? 'Close' : 'Cancel'}
              </button>
              {previewData.length > 0 && !importResults && (
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="px-6 py-2 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? 'Importing...' : `Import ${previewData.length} Clubs`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
