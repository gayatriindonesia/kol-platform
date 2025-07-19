export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto px-4 md:px-6 py-4">
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Gayatri Indonesia. All rights reserved.
        </div>
      </div>
    </footer>
  )
}