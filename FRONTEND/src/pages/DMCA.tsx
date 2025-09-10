import React, { useEffect } from 'react';

const DMCA: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20 min-h-screen bg-dark-300">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-dark-200 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-white">DMCA & Legal Information</h1>
          
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-primary-500">About Our Service</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              This website functions solely as a search engine and link indexer. Preview images 
              shown are minimal representations of publicly available content for identification 
              purposes only, similar to how search engines display image previews in their results. 
              We do not claim any rights or ownership over any indexed content or previews.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-primary-500">Disclaimer</h2>
            <div className="bg-dark-300 rounded-lg p-5 border-l-4 border-primary-500">
              <p className="text-gray-300 leading-relaxed mb-4">
                This website contains adult content and is intended for individuals aged 18 or older only. 
                By entering this website, you acknowledge that you are of legal age and understand that the 
                content may be offensive to some. The content on this website is for personal use only and 
                is not to be shared or distributed to anyone under the age of 18.
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary-500">DMCA</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              All content available on this site is freely accessible and is not uploaded by our team. 
              We do not host any content on our servers. If you suspect that your copyrighted material 
              has been reproduced in a manner that constitutes copyright infringement, please reach out 
              to us at <a href="mailto:contact@extremeleaks.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                contact@extremeleaks.com
              </a> for appropriate action.
            </p>
            
            <div className="bg-dark-400 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3 text-white">How to Submit a DMCA Notice</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Identify the specific content that you believe infringes your copyright</li>
                <li>Provide your contact information (name, address, email)</li>
                <li>Include a statement that you have a good-faith belief that the use is not authorized</li>
                <li>Include a statement that the information in your notice is accurate</li>
                <li>Include your physical or electronic signature</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default DMCA;