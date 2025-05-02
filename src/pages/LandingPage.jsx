import AnimationWrapper from "../common/page-animation";
import HeroUserIcon from "../imgs/hero-user-icon.png";
import HeroTagIcon from "../imgs/hero-tag-icon.png";
import { Link } from "react-router-dom";

const LandingPage = () => {
    return (
        <AnimationWrapper>
            <div className="container px-4 sm:px-6 lg:px-10">
                <div className="hero mt-28 sm:mt-12 md:mt-6">
                    <div className="text-left">
                        {/* Main Heading */}
                        <h1 className="font-futura text-balance mb-[5px] sm:mb-4 text-[55px]  lg:text-[70px] text-black leading-[60px] lg:leading-tight">
                            A place where <br />your <span className="hero-text-colored">creativity</span> <br />turns into <span className="hero-text-colored">money</span>
                        </h1>


                        {/* Subheading */}
                        <p className="font-futura mt-2 mb-9 sm:mt-2 text-base text-[16px] sm:text-lg lg:text-xl font-medium text-black">
                            Empower your <span className="hero-text-colored">content creation journey</span> with seamless<br />
                            <span className="hero-text-colored">monetization tools</span> and a <span className="hero-text-colored">thriving community</span> of <span className="hero-text-colored">1M+ subscribers</span>
                        </p>

                        {/* CTA Button */}
                        <div className="mt-6 sm:mt-4 flex items-center justify-start gap-x-4 sm:gap-x-6">
                            <Link to="/signup">
                                <button className="font-montserrat btn-bg-active text-white py-3 px-6 sm:px-8 rounded-full shadow-lg text-sm sm:text-lg">
                                    Start Monetizing
                                </button>
                            </Link>
                        </div>

                        {/* Statistics Section */}
<div className="mt-12 flex flex-col sm:flex-row flex-wrap items-center gap-8">
    {/* Creators */}
    <div className="flex items-center gap-4 justify-start w-full sm:w-auto">
        <img loading="lazy"
            src={HeroUserIcon}
            alt="Hero User Icon"
            className="w-10 sm:w-12"
        />
        <div className="flex font-montserrat text-left items-stretch">
            <h2 className="text-xl font-montserrat sm:text-2xl lg:text-3xl text-colored font-extrabold flex items-center">
                100K+
            </h2>
            <div>
                <div className="text-sm sm:text-base lg:text-lg font-semibold">
                    Content
                </div>
                <div className="text-sm sm:text-base lg:text-lg font-semibold">
                    Creators & Influencers
                </div>
            </div>
        </div>

    </div>

    {/* Subscribers */}
    <div className="flex items-center gap-4 justify-end w-full sm:w-auto">
        <img loading="lazy"
            src={HeroTagIcon}
            alt="Hero Tag Icon"
            className="w-10 sm:w-12"
        />
        <div className="flex font-montserrat text-right items-stretch">
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-montserrat text-colored font-extrabold flex items-center">
                1M+
            </h2>
            <div>
                <div className="text-sm text-left sm:text-base lg:text-lg font-semibold">
                    Active
                </div>
                <div className="text-sm sm:text-base lg:text-lg font-semibold">
                    Subscribers
                </div>
            </div>
</div>

    </div>
</div>


                    </div>
                </div>
            </div>
        </AnimationWrapper>
    );
};

export default LandingPage;
