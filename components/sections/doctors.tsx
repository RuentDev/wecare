import { mockDoctors } from '@/lib/mock-data'
import { Card } from '../ui/card'
import { Star } from 'lucide-react'

const Doctors = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Our Healthcare Professionals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDoctors.map(doctor => (
                <Card key={doctor.id} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{doctor.avatar}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-dark">{doctor.name}</h3>
                      <p className="text-sm text-secondary font-medium">{doctor.specialty}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-neutral-dark">
                          {doctor.rating} ({doctor.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-gray mt-4">{doctor.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
  )
}

export default Doctors