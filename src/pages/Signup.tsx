import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import services from "../services/services";
import { Image } from "@chakra-ui/react";
import HushhLogo from "../components/images/Hushhogo.png";
import config from "../resources/config/config";

// Animation variants for smooth animations
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
      ease: [0.25, 0.46, 0.45, 0.94],
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

export default function Signup() {
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
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-8"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      <motion.div 
        className="w-full max-w-[420px] flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo Container */}
        <motion.div className="mb-6" variants={logoVariants}>
          <Link to="/">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-[#131811] flex items-center justify-center">
              <Image 
                src={HushhLogo} 
                alt="Hushh Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </motion.div>
        
        {/* Header Text */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-[28px] font-bold leading-tight mb-2 text-[#131811]">
            Create your account.
          </h1>
          <p className="text-gray-500 text-base font-medium leading-normal">
            Join Hushh to access AI-powered investment insights and build long-term wealth.
          </p>
        </motion.div>

        {/* Social Sign Up Buttons */}
        <motion.div className="w-full flex flex-col gap-3" variants={itemVariants}>
          {/* Apple Sign Up - Black */}
          <motion.button
            type="button"
            className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#131811] text-white hover:bg-black transition-colors duration-200"
            onClick={() => services.authentication.appleSignIn()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 absolute left-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-base font-bold tracking-[0.015em]">Sign up with Apple</span>
          </motion.button>

          {/* Google Sign Up - Light Gray */}
          <motion.button
            type="button"
            className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#f1f4f0] text-[#131811] hover:bg-[#e2e8e0] transition-colors duration-200 border border-transparent"
            onClick={() => services.authentication.googleSignIn()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 absolute left-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-base font-bold tracking-[0.015em]">Sign up with Google</span>
          </motion.button>
        </motion.div>

        {/* Log In Link */}
        <motion.div 
          className="w-full text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[#131811] text-base font-medium">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-[#2589f5] font-bold hover:underline transition-all"
            >
              Log in
            </Link>
          </p>
        </motion.div>

        {/* Terms and Privacy */}
        <motion.div 
          className="w-full text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
            By continuing, you agree to our{" "}
            <Link 
              to="/terms" 
              className="hover:text-gray-600 underline decoration-1 underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link 
              to="/privacy" 
              className="hover:text-gray-600 underline decoration-1 underline-offset-2"
            >
              Privacy Policy
            </Link>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
