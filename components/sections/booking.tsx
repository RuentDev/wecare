import { Clock, Shield, Star } from 'lucide-react'
import { Card } from '../ui/card'

const Booking = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-neutral-light">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Why Choose WeCare?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: 'Easy Scheduling',
                  description: 'Book appointments in minutes with our intuitive booking system.',
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: 'Professional Care',
                  description: 'Access to qualified and verified healthcare professionals.',
                },
                {
                  icon: <Star className="w-8 h-8" />,
                  title: 'Patient Focused',
                  description: 'Your health and comfort are our top priorities.',
                },
              ].map((feature, idx) => (
                <Card key={idx} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-neutral-dark mb-2">{feature.title}</h3>
                  <p className="text-neutral-gray">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

  )
}

export default Booking