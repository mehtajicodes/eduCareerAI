"use client";

import { motion } from "framer-motion";
import { 
  Brain, 
  BookOpen, 
  Briefcase, 
  Users, 
  BarChart2, 
  MessageSquare,
  Target,
  Award
} from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how eduCareer AI can help you achieve your educational and career goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
            <p className="text-xl text-gray-600 mt-4">
              What makes eduCareer AI unique
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const services = [
  {
    title: "AI Career Guidance",
    description: "Get personalized career recommendations based on your skills, interests, and goals.",
    icon: <Brain className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Educational Resources",
    description: "Access a comprehensive library of learning materials and courses.",
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Career Path Planning",
    description: "Create a detailed roadmap for your professional development.",
    icon: <Target className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Skill Assessment",
    description: "Evaluate your current skills and identify areas for improvement.",
    icon: <Award className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Industry Insights",
    description: "Stay updated with the latest trends and opportunities in your field.",
    icon: <BarChart2 className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Professional Networking",
    description: "Connect with mentors and peers in your industry.",
    icon: <Users className="w-8 h-8 text-blue-600" />,
  },
];

const features = [
  {
    title: "Personalized Recommendations",
    description: "Our AI analyzes your profile to provide tailored career and educational suggestions.",
    icon: <Brain className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Real-time Updates",
    description: "Stay informed about new opportunities and industry developments.",
    icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Comprehensive Resources",
    description: "Access a wide range of educational materials and career guidance tools.",
    icon: <BookOpen className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Career Path Visualization",
    description: "Visualize your potential career paths and required steps to achieve your goals.",
    icon: <Briefcase className="w-6 h-6 text-blue-600" />,
  },
]; 