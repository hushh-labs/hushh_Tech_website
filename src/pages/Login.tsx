import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import services from "../services/services";
import { Image } from "@chakra-ui/react";
import HushhLogo from "../components/images/Hushhogo.png";
import config from "../resources/config/config";

// Animation variants for Apple-like smooth animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // Apple-like ease curve
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!config.supabaseClient) {
      return;
    }

    config.supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/hushh-user-profile");
      }
    });

    const {
      data: { subscription },
    } = config.supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/hushh-user-profile");
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif' }}
    >
      <motion.div 
        className="max-w-[420px] w-full mx-auto px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo and Header */}
        <motion.div className="flex flex-col items-center gap-5 mb-8" variants={itemVariants}>
          <motion.div variants={logoVariants}>
            <Link to="/">
              <Image 
                src={HushhLogo} 
                alt="Hushh Logo" 
                className="h-[72px] w-[72px]" 
              />
            </Link>
          </motion.div>
          
          <motion.div className="space-y-3 text-center" variants={itemVariants}>
            <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.015em] text-[#1D1D1F]">
              Investing in the Future.
            </h1>
            <p className="text-[17px] leading-[1.5] text-[#515154] max-w-[340px]">
              The AI-Powered Berkshire Hathaway. We combine AI and human expertise to invest in exceptional businesses.
            </p>
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div 
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          variants={cardVariants}
        >
          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            {/* Apple Sign In - First (Black, Apple Style) */}
            <motion.button
              type="button"
              className="w-full h-[52px] flex justify-center items-center gap-3 px-4 rounded-[14px] text-[16px] font-medium text-white bg-[#000000] transition-all duration-200 hover:bg-[#1a1a1a] active:bg-[#333333]"
              onClick={() => services.authentication.appleSignIn()}
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Sign in with Apple
            </motion.button>

            {/* Google Sign In - Second */}
            <motion.button
              type="button"
              className="w-full h-[52px] flex justify-center items-center gap-3 px-4 border border-[#E5E7EB] rounded-[14px] text-[16px] font-medium text-[#1D1D1F] bg-white transition-all duration-200 hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
              onClick={() => services.authentication.googleSignIn()}
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </motion.button>
          </div>

          {/* Sign Up Link - Directly below social buttons */}
          <motion.div 
            className="text-center mt-6 pt-5 border-t border-[#E5E7EB]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[15px] text-[#515154]">
              Don't have an account?{" "}
              <Link 
                to="/signUp" 
                className="text-[#00A9E0] hover:underline font-semibold transition-colors duration-150"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-[12px] text-[#8E8E93] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
}
