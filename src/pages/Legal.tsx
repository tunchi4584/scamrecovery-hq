
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Eye, Lock } from 'lucide-react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Legal Information
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Your privacy and rights are our priority. Review our legal policies and compliance information.
            </p>
          </div>
        </div>
      </section>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg">Privacy Policy</h3>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg">Terms of Service</h3>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg">Disclaimers</h3>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg">GDPR Compliance</h3>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Policy */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center">
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Privacy Policy
              </CardTitle>
              <p className="text-gray-600">Last updated: January 1, 2024</p>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                request our services, or communicate with us. This may include your name, email address, 
                phone number, and details about your case.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>To provide and improve our scam recovery services</li>
                <li>To communicate with you about your case and our services</li>
                <li>To comply with legal obligations and assist law enforcement</li>
                <li>To protect against fraud and maintain security</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We do not sell or rent your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Law enforcement agencies when required by law</li>
                <li>Financial institutions to facilitate recovery efforts</li>
                <li>Service providers who assist us in operating our business</li>
                <li>Legal authorities as required to comply with valid legal processes</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. All 
                sensitive data is encrypted both in transit and at rest.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                You have the right to access, update, or delete your personal information. You may also 
                opt out of certain communications from us. Contact us at privacy@scamrecovery.com to 
                exercise these rights.
              </p>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                Terms of Service
              </CardTitle>
              <p className="text-gray-600">Last updated: January 1, 2024</p>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                By accessing and using our services, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                ScamRecovery Pro provides fund recovery services for victims of financial fraud and 
                scams. We use legal and ethical methods to assist in the recovery of stolen funds, 
                but cannot guarantee successful recovery in all cases.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fees and Payment</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Initial consultations are provided free of charge</li>
                <li>Recovery fees are based on successful fund recovery</li>
                <li>All fees will be clearly disclosed before service commencement</li>
                <li>Payment is due only upon successful recovery of funds</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Client Responsibilities</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Clients must provide accurate and complete information about their case, cooperate 
                with our investigation process, and promptly respond to requests for additional 
                documentation or information.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our liability is limited to the fees paid for our services. We are not responsible 
                for consequential damages or losses beyond our direct control. Success rates are 
                based on historical data and do not guarantee future results.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center">
                <Eye className="h-8 w-8 mr-3 text-blue-600" />
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Guarantee of Recovery</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                While we have a high success rate, we cannot guarantee the recovery of funds in every 
                case. Each situation is unique and depends on various factors including the type of 
                scam, time elapsed, and cooperation from financial institutions.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Legal Compliance</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                All our recovery methods comply with applicable laws and regulations. We do not engage 
                in any illegal activities and work closely with law enforcement agencies when required.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Educational Content</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Information provided on our website and in our communications is for educational 
                purposes only and should not be considered as legal advice. For specific legal 
                questions, please consult with a qualified attorney.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for 
                the content, privacy policies, or practices of these external sites.
              </p>
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center">
                <Lock className="h-8 w-8 mr-3 text-blue-600" />
                GDPR & CCPA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Rights</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Under the General Data Protection Regulation (GDPR) and California Consumer Privacy 
                Act (CCPA), you have specific rights regarding your personal data:
              </p>

              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li><strong>Right to Access:</strong> Request information about data we have collected</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Right to Object:</strong> Object to processing of your data for marketing purposes</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lawful Basis for Processing</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We process personal data based on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Consent for marketing communications</li>
                <li>Contract performance for service delivery</li>
                <li>Legal obligations for compliance requirements</li>
                <li>Legitimate interests for fraud prevention and security</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We retain personal data only as long as necessary for the purposes outlined in our 
                privacy policy or as required by law. Case files are typically retained for 7 years 
                after case closure for legal and regulatory compliance.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Our Data Protection Officer</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                For questions about data protection or to exercise your rights, contact our Data 
                Protection Officer at: dpo@scamrecovery.com
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Legal Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">General Legal Inquiries</h4>
                  <p className="text-gray-700">legal@scamrecovery.com</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Privacy & Data Protection</h4>
                  <p className="text-gray-700">privacy@scamrecovery.com</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Compliance Officer</h4>
                  <p className="text-gray-700">compliance@scamrecovery.com</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Mailing Address</h4>
                  <p className="text-gray-700">
                    ScamRecovery Pro LLC<br />
                    Legal Department<br />
                    123 Financial District<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
