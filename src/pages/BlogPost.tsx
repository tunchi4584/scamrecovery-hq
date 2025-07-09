
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

const blogPosts = {
  'recovery-timeline': {
    title: 'How Long Does Scam Recovery Take? Complete Timeline Guide',
    author: 'ScamRecovery Team',
    date: '2024-07-08',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    content: [
      {
        type: 'paragraph',
        text: 'One of the most common questions we receive is: "How long will it take to recover my stolen funds?" While every case is unique, we can provide a general timeline based on our experience with thousands of recovery cases.'
      },
      {
        type: 'heading',
        text: 'Typical Recovery Timeline: 3-10 Days'
      },
      {
        type: 'paragraph',
        text: 'Our average recovery time is 3-7 days for most cases, with complex international cases taking up to 10 days. This rapid timeline is possible due to our advanced tracking technology and established relationships with financial institutions worldwide.'
      },
      {
        type: 'heading',
        text: 'Factors That Affect Recovery Time'
      },
      {
        type: 'list',
        items: [
          'Type of scam (investment, romance, crypto, etc.)',
          'Amount involved and complexity of transactions',
          'Time elapsed since the scam occurred',
          'Cooperation from financial institutions',
          'International vs domestic transactions',
          'Quality of evidence and documentation provided'
        ]
      },
      {
        type: 'heading',
        text: 'Phase 1: Initial Assessment (Day 1)'
      },
      {
        type: 'paragraph',
        text: 'Within 24 hours of your case submission, our team conducts a thorough analysis of your situation. We trace the money flow, identify the scammers\' methods, and develop a recovery strategy tailored to your specific case.'
      },
      {
        type: 'heading',
        text: 'Phase 2: Active Recovery (Days 2-5)'
      },
      {
        type: 'paragraph',
        text: 'This is where the real work happens. Our team contacts financial institutions, files recovery requests, and uses our advanced blockchain analysis tools for cryptocurrency cases. Most recoveries are completed during this phase.'
      },
      {
        type: 'heading',
        text: 'Phase 3: Fund Return (Days 3-7)'
      },
      {
        type: 'paragraph',
        text: 'Once funds are recovered, they are typically returned to your account within 2-3 business days, depending on your bank\'s processing times.'
      }
    ]
  },
  'prevention-tips': {
    title: '10 Essential Tips to Avoid Online Scams in 2024',
    author: 'Security Expert Team',
    date: '2024-07-07',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    content: [
      {
        type: 'paragraph',
        text: 'Online scams are becoming increasingly sophisticated, but with the right knowledge and vigilance, you can protect yourself from becoming a victim. Here are our top 10 tips for staying safe online.'
      },
      {
        type: 'heading',
        text: '1. Verify Before You Trust'
      },
      {
        type: 'paragraph',
        text: 'Always verify the identity of anyone asking for money or personal information. Use independent contact methods to confirm requests, especially for large transactions or urgent demands.'
      },
      {
        type: 'heading',
        text: '2. Be Skeptical of "Too Good to Be True" Offers'
      },
      {
        type: 'paragraph',
        text: 'High returns with low risk, guaranteed profits, or exclusive investment opportunities are often scams. Legitimate investments always carry risk, and high returns typically mean high risk.'
      },
      {
        type: 'heading',
        text: '3. Protect Your Personal Information'
      },
      {
        type: 'paragraph',
        text: 'Never share sensitive information like Social Security numbers, bank account details, or passwords via email, phone, or text unless you initiated the contact with a verified organization.'
      },
      {
        type: 'heading',
        text: '4. Use Secure Payment Methods'
      },
      {
        type: 'paragraph',
        text: 'Avoid wire transfers, gift cards, or cryptocurrency payments to unknown parties. These payment methods offer little to no protection if you\'re scammed.'
      },
      {
        type: 'heading',
        text: '5. Research Investment Opportunities'
      },
      {
        type: 'paragraph',
        text: 'Before investing, research the company thoroughly. Check with regulatory bodies, read reviews, and be wary of pressure tactics or time-limited offers.'
      }
    ]
  },
  'crypto-recovery': {
    title: 'Cryptocurrency Recovery: What You Need to Know',
    author: 'Crypto Recovery Team',
    date: '2024-07-06',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    content: [
      {
        type: 'paragraph',
        text: 'Cryptocurrency scams are on the rise, but recovery is possible with the right expertise and tools. Our specialized crypto recovery team has successfully retrieved millions in stolen digital assets.'
      },
      {
        type: 'heading',
        text: 'How Cryptocurrency Recovery Works'
      },
      {
        type: 'paragraph',
        text: 'Unlike traditional financial transactions, cryptocurrency movements are recorded on public blockchains. This transparency allows our experts to trace stolen funds through complex transaction networks.'
      },
      {
        type: 'heading',
        text: 'Advanced Blockchain Analysis'
      },
      {
        type: 'paragraph',
        text: 'We use cutting-edge blockchain analysis tools to follow the money trail, identify wallet addresses, and work with exchanges to freeze and recover stolen cryptocurrency.'
      },
      {
        type: 'heading',
        text: 'Common Crypto Scam Types'
      },
      {
        type: 'list',
        items: [
          'Fake investment platforms and trading apps',
          'Romance scams involving crypto payments',
          'Social media cryptocurrency giveaway scams',
          'Fake cryptocurrency exchanges',
          'Mining scams and cloud mining fraud',
          'NFT and DeFi protocol scams'
        ]
      },
      {
        type: 'heading',
        text: 'Recovery Success Rates'
      },
      {
        type: 'paragraph',
        text: 'Our cryptocurrency recovery success rate is over 85% for cases reported within 30 days. The sooner you report the theft, the better your chances of recovery.'
      }
    ]
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug as keyof typeof blogPosts] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Header />
      
      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime}
            </div>
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {post.content.map((section, index) => {
            switch (section.type) {
              case 'heading':
                return (
                  <h2 key={index} className="text-2xl font-bold text-foreground dark:text-white mt-8 mb-4">
                    {section.text}
                  </h2>
                );
              case 'paragraph':
                return (
                  <p key={index} className="text-lg leading-relaxed text-foreground dark:text-gray-300 mb-6">
                    {section.text}
                  </p>
                );
              case 'list':
                return (
                  <ul key={index} className="list-disc pl-6 mb-6 space-y-2">
                    {section.items?.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-lg text-foreground dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              default:
                return null;
            }
          })}
        </div>

        <div className="mt-12 p-8 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-2xl font-bold text-foreground dark:text-white mb-4">
            Need Help with Scam Recovery?
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            If you've been scammed, don't wait. Our expert team is ready to help you recover your funds.
          </p>
          <Link to="/#free-review">
            <Button size="lg">Get Free Case Review</Button>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
