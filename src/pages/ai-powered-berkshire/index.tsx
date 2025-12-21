import React from 'react';
import { Box } from "@chakra-ui/react";
import { Helmet } from "react-helmet";

const AIPoweredBerkshirePage = () => {
  return (
    <>
      <Helmet>
        <title>The AI-Powered Berkshire Hathaway | Hushh Fund A</title>
        <meta name="description" content="Hushh Technologies Fund A Strategy – Investing in the Future of Free Cash Flow" />
      </Helmet>

      <Box 
        position="fixed"
        top="64px"
        left="0"
        right="0"
        bottom="0"
        width="100vw"
        height="calc(100vh - 64px)"
        overflow="hidden"
        margin="0"
        padding="0"
        zIndex="999"
        bg="white"
      >
        <Box
          as="iframe"
          src="https://hushh-fund-a-wtv9ctn.gamma.site/"
          title="The AI-Powered Berkshire Hathaway - Hushh Fund A Strategy"
          allowFullScreen
          width="100%"
          height="100%"
          border="0"
          display="block"
        />
      </Box>
    </>
  );
};

export default AIPoweredBerkshirePage;
