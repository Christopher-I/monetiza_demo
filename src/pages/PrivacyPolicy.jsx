import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div>
      <pre className="max-w-full text-wrap p-20">
        <span className='font-bold text-3xl text-center block'>Privacy Policy</span>
        <br /><br />
        1. Introduction <br />
        Welcome to Monetiza. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data when you use our services, including signing in with Google or Twitter and completing KYC (Know Your Customer) verification.
        <br /><br />
        By using Monetiza, you agree to the collection and use of your information as described in this Privacy Policy.
        <br /><br />
        2. Information We Collect <br />
        We collect and store the following data:
        <br /><br />
        2.1 Account Information <br />
        - Google Login: We only collect and store your email address. <br />
        - Twitter Login: We collect and store your username and email address.
        <br /><br />
        2.2 KYC (Know Your Customer) Verification <br />
        For identity verification and compliance with financial regulations, we may collect: <br />
        - Full Name <br />
        - Government-issued ID <br />
        - Proof of Address
        <br /><br />
        3. How We Use Your Information <br />
        We use your data for the following purposes:<br />
        - To provide and improve our services<br />
        - To verify your identity and comply with legal requirements<br />
        - To ensure platform security and prevent fraud<br />
        - To communicate updates, security alerts, or policy changes<br />
        - To comply with applicable laws and regulations
        <br /><br />
        4. Data Sharing & Third Parties <br />
        We do not sell your personal data. However, we may share information in the following cases:<br />
        - KYC Providers: We share necessary details with third-party identity verification services for compliance purposes.<br />
        - Legal Compliance: If required by law or to enforce our policies, we may disclose your information to authorities.<br />
        - Service Providers: We may use third-party providers for analytics, security, and infrastructure services.
        <br /><br />
        5. Data Security<br />
        We take reasonable security measures to protect your data from unauthorized access, alteration, or loss. However, no system is 100% secure, and we encourage you to use strong passwords and enable two-factor authentication (2FA) where applicable.
        <br /><br />
        6. Your Rights & Control Over Your Data<br />
        You have the right to:<br />
        - Request access to your data<br />
        - Request deletion of your personal information (subject to legal requirements)<br />
        - Update or correct inaccuracies in your account details<br />
        - Withdraw consent for data processing where applicable
        <br /><br />
        7. Data Retention<br />
        We retain your data only as long as necessary for legal, regulatory, or operational purposes. KYC data is stored securely and deleted when no longer required.
      </pre>
    </div>
  )
}

export default PrivacyPolicy
