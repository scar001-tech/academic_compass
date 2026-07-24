import { AppLayout } from '../layouts/AppLayout'

export function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Drumvale Secondary School</h1>
            <p className="text-xl mb-8">Excellence Through Education</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold">
              Apply Now
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-3">Academic Excellence</h3>
              <p className="text-gray-600">World-class curriculum delivered by experienced educators</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-3">Holistic Development</h3>
              <p className="text-gray-600">Sports, arts, and leadership programs for well-rounded growth</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-3">Modern Facilities</h3>
              <p className="text-gray-600">State-of-the-art infrastructure and technology resources</p>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12">Latest News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <article key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gradient-to-r from-blue-900 to-blue-700"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">News Article {i}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    <a href="#" className="text-blue-900 font-semibold hover:text-orange-500">
                      Read More →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-lg mb-8 opacity-90">
              Contact us today to learn more about admissions and our programs
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold">
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
