export default function ClubEditPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Edit Club</h1>
      <p className="text-gray-600 text-sm mb-6">
        Editing club ID: <span className="font-mono">{params.id}</span>
      </p>
      <p className="text-gray-500">Form to update club info will go here.</p>
    </div>
  );
}
