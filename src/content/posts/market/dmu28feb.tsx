import React from 'react';
import { Box, Text, Image, Heading, VStack, Divider, List, ListItem } from '@chakra-ui/react';
import q1 from '../../../components/images/market-updates/dmu28feb/q1.jpg';
import q2 from '../../../components/images/market-updates/dmu28feb/q2.jpg';
import q3 from '../../../components/images/market-updates/dmu28feb/q3.jpg';
import q4 from '../../../components/images/market-updates/dmu28feb/q4.jpg';
import q5 from '../../../components/images/market-updates/dmu28feb/q5.jpg';
import q6 from '../../../components/images/market-updates/dmu28feb/q6.jpg';
import q7 from '../../../components/images/market-updates/dmu28feb/q7.jpg';
import q8 from '../../../components/images/market-updates/dmu28feb/q8.jpg';
import MarketUpdateGallery from '../../../components/MarketUpdateGallery';


const Dmu28Feb = () => {
  return (
    <Box color="black" borderRadius="md">
      <Heading as="h2" fontSize="2xl" mb={4} color="black">
        🤫 Aloha Alpha Fund — February 28, 2025 Performance Recap
      </Heading>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Today’s Performance (Feb 28, 2025):
      </Heading>
      <VStack align="start" spacing={4}>
        <List spacing={2}>
          <ListItem>Net Gain: $114,975.92 (+9.41%)</ListItem>
          <ListItem>Total Gains: $118,746.00</ListItem>
          <ListItem>Total Losses: -$3,770.08</ListItem>
          <ListItem>Gain/Loss Ratio: 96.92%</ListItem>
          <ListItem>Gain Count: 311 transactions</ListItem>
          <ListItem>Loss Count: 21 transactions</ListItem>
          <ListItem>Average Gain: +11.82%</ListItem>
          <ListItem>Average Loss: -1.74%</ListItem>
        </List>
      </VStack>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Year-to-Date (YTD, Jan 1 – Feb 28, 2025):
      </Heading>
      <VStack align="start" spacing={4}>
        <List spacing={2}>
          <ListItem>Net Gain: $853,095.60 (+3.61%)</ListItem>
          <ListItem>Total Gains: $1,506,592.18</ListItem>
          <ListItem>Total Losses: -$653,496.58</ListItem>
          <ListItem>Gain/Loss Ratio: 69.75%</ListItem>
          <ListItem>Gain Count: 2,779 transactions</ListItem>
          <ListItem>Loss Count: 256 transactions</ListItem>
          <ListItem>Average Gain: +11.74%</ListItem>
          <ListItem>Average Loss: -6.05%</ListItem>
          <ListItem>Gain Rate: 91.57%</ListItem>
        </List>
      </VStack>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Fund Summary (as of Market Close, Feb 28, 2025):
      </Heading>
      <VStack align="start" spacing={4}>
        <List spacing={2}>
          <ListItem>NAV (Net Asset Value): $9.55M (New High Water Mark)</ListItem>
          <ListItem>Cash & Sweep Vehicle: $7.5M (New High Water Mark)</ListItem>
        </List>
      </VStack>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Strategic Highlights:
      </Heading>
      <VStack align="start" spacing={4}>
        <List spacing={2}>
          <ListItem>Record-setting day for executing “Sell the Wall” strategies, successfully rolling over multiple positions.</ListItem>
          <ListItem>Continued disciplined approach to premium collection, driving alpha income despite market volatility.</ListItem>
          <ListItem>Maintained robust liquidity and margin control, ensuring ample flexibility for strategic execution.</ListItem>
        </List>
      </VStack>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Market Context:
      </Heading>
      <VStack align="start" spacing={4}>
        <List spacing={2}>
          <ListItem>Positive market close:</ListItem>
          <ListItem>Dow Jones: +1.39%</ListItem>
          <ListItem>NASDAQ: +1.62%</ListItem>
          <ListItem>Portfolio increased by +1.69%, outperforming broader indices.</ListItem>
        </List>
      </VStack>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Commentary:
      </Heading>
      <VStack align="start" spacing={4}>
        <Text>
          Today’s performance illustrates the fund’s resilience and precision execution, especially through strategic option rolling, systematically capturing premiums while effectively managing risks. February 2025 stands out as one of the fund’s strongest months, reinforcing our confidence in our ongoing strategy.
        </Text>
      </VStack>

      <Divider my={4} borderColor="black" />

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Closing Thoughts:
      </Heading>
      <VStack align="start" spacing={4}>
        <Text>
          Gratitude and humility remain core to our approach. Excellent execution today—let’s carry this momentum forward into March!
        </Text>
        <Text>
          Congratulations on another successful trading day and month-end! 🚀🌞🌿
        </Text>
        <Text>
          Manish
        </Text>
      </VStack>

      <Heading as="h3" fontSize="lg" color="black" mb={4}>
        Reference:
      </Heading>
      <MarketUpdateGallery 
        date="dmu28feb" 
        title="Supporting Charts & Data"
      />
    </Box>
  );
};

export default Dmu28Feb;
