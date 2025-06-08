# CareerLearn AI - AI-Powered Career Learning Platform

CareerLearn AI is a modern web application that provides personalized learning paths and mentorship opportunities for various tech careers. The platform leverages AI to generate customized learning content and connects learners with industry professionals.

![CareerLearn AI Platform](https://i.ibb.co/MP5cq1z/Get-Started-With-Tippy.png)

## Features

### 🎯 Personalized Learning Paths
- AI-generated curriculum based on career goals
- Custom career path generation
- Progress tracking and milestones
- Interactive learning modules

### 💳 Payment Integration
- Secure payment processing with PaymanAI-SDK
- Subscription management for premium features
- Multi-currency support
- Automated invoicing system

### 👥 Expert Mentorship
- Connect with industry professionals
- Book mentoring sessions
- Real-time feedback on projects
- Career guidance from experts

## Technology Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI
- **Payment**: PaymanAI-SDK v2.0
- **Icons**: Lucide React
- **Authentication**: PaymanAI-OAUTH
- **Backend**: node websocket server

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PaymanAI-SDK API credentials
- Google Gemini API key

### Environment Setup

1. Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
PAYMAN_API_KEY=your_payman_api_key_here
PAYMAN_SECRET_KEY=your_payman_secret_key_here
PAYMAN_WEBHOOK_SECRET=your_webhook_secret_here
```

### Payment Setup

1. Install PaymanAI-SDK:
```bash
npm install @payman/sdk @payman/oauth
```

2. Initialize PaymanAI in your project:
```typescript
import { PaymanSDK } from '@payman/sdk';

const payman = new PaymanSDK({
  apiKey: process.env.PAYMAN_API_KEY,
  secretKey: process.env.PAYMAN_SECRET_KEY
});
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eduCareerAI.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── LearningPath/
│   ├── MentorList/
│   └── PaymentForm/  # Payment integration
├── hooks/           # Custom React hooks
│   └── usePayman/   # Payment hooks
└── types/           # TypeScript type definitions
```

## Key Components

### Learning Path Generator
- AI-powered curriculum generation
- Custom career path input
- Progress tracking
- Interactive content

### Payment Integration
- Secure payment processing
- Subscription management
- Transaction handling
- Payment analytics

### Mentor Marketplace
- Expert profiles
- Booking system
- Payment integration
- Session management

## Subscription Plans

### Free Tier
- Basic learning paths
- Community access
- Limited content access

### Premium Tier ($19.99/month)
- Full learning paths
- Priority support
- Unlimited content access

### Professional Tier ($49.99/month)
- Everything in Premium
- 1-on-1 mentoring sessions
- Career coaching
- Certification preparation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- PaymanAI for payment infrastructure
- Google Gemini AI for content generation
- Unsplash for stock images