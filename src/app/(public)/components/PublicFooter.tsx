export default function PublicFooter() {
  return (
    <footer className="border-t py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} SoccerConnect. All rights reserved.</p>
      </div>
    </footer>
  );
}
