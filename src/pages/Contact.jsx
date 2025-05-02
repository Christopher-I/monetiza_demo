import AnimationWrapper from "../common/page-animation";

const Contact = () => {
    return (
        <AnimationWrapper>
            <div className="container ">
                    <div className="text-left px-6 lg:px-12">
                        <h1 className="font-montserrat text-2xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-black">
                            Contact Us
                        </h1>
                        <p className="font-futura mt-5 text-lg sm:text-xl lg:text-2xl font-bold text-black">
                            Email, call to learn how Monetiza+ can solve your challenges.
                        </p>
                        <div className="mt-10">
                            <p className="font-futura italic text-lg sm:text-xl text-black mb-2">
                                info@monetizamais.com
                            </p>
                            <p className="font-futura text-lg sm:text-xl text-black">+1(760)-292-2800</p>
                        </div>

                        <div className="font-futura mt-12 flex flex-col lg:flex-row gap-y-10 lg:gap-x-14">
                            <div className="w-full lg:w-1/2">
                                <h2 className="text-2xl sm:text-3xl font-bold text-black">
                                    Customer Support
                                </h2>
                                <p className="font-futura mt-4 text-base sm:text-lg lg:text-xl font-medium text-black">
                                    Our support team is always available to assist you with any challenges you may face.
                                    Contact us at: support@monetizamais.com
                                </p>
                            </div>

                            <div className="w-full lg:w-1/2">
                                <h2 className="font-futura text-2xl sm:text-3xl font-bold text-black">
                                    Feedback and Suggestions
                                </h2>
                                <p className="font-futura mt-4 text-base sm:text-lg lg:text-xl font-medium text-black">
                                    We value your feedback and are continuously working to improve Monetiza+. Your input is crucial in shaping the future of Monetiza+.
                                </p>
                            </div>
                        </div>
                    </div>
            </div>
        </AnimationWrapper>
    );
};

export default Contact;
