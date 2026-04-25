const Footer = () => {
  return (
    <footer className="bg-neutral-dark text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4">About WeCare</h4>
                <p className="text-sm text-gray-300">Quality healthcare made accessible to everyone.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li><a href="#" className="hover:text-white transition">Consultation</a></li>
                  <li><a href="#" className="hover:text-white transition">Follow-up</a></li>
                  <li><a href="#" className="hover:text-white transition">Treatments</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
              <p>&copy; 2026 WeCare Clinic. All rights reserved.</p>
            </div>
          </div>
        </footer>
  )
}

export default Footer