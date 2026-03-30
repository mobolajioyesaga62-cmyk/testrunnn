import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-300">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-amber-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-2">Mon-Fri from 8am to 6pm</p>
            <p className="text-lg font-semibold text-gray-900">+234 800 123 4567</p>
          </Card>

          <Card className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-2">Our team will respond within 24 hours</p>
            <p className="text-lg font-semibold text-gray-900">info@afriquestyle.com</p>
          </Card>

          <Card className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-2">Come see our showroom</p>
            <p className="text-lg font-semibold text-gray-900">Lagos, Nigeria</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <Button type="submit" size="lg" fullWidth>
                  <Send size={20} />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Afrique Style</h2>
            <Card className="mb-6">
              <p className="text-gray-700 mb-4">
                Afrique Style is Nigeria's premier destination for authentic African fashion. We specialize in
                traditional and contemporary clothing that celebrates the rich cultural heritage of Africa while
                embracing modern style.
              </p>
              <p className="text-gray-700 mb-4">
                Our mission is to provide high-quality, beautifully crafted garments that honor African traditions
                and make our customers look and feel their best for every occasion.
              </p>
              <p className="text-gray-700">
                From elegant Ankara dresses to traditional Agbada sets, custom wedding packages to everyday wear,
                we offer a comprehensive selection of fashion items that cater to the diverse needs of our customers
                across Nigeria and beyond.
              </p>
            </Card>

            <Card>
              <div className="flex items-start gap-4 mb-4">
                <Clock className="text-amber-600 mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 5:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
