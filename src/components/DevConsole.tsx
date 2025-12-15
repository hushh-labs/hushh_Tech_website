/**
 * DevConsole - Custom Developer Console for Hushh Technologies
 * 
 * A native React developer console integrated directly into the website.
 * Features: Console logs, System info, Network monitoring, Element inspection, Storage viewer
 * 
 * Activation: Tap Hushh logo 5 times or add ?debug=true to URL
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex, Text, Input, Button, IconButton, Badge, useColorModeValue } from '@chakra-ui/react';
import { FiX, FiTrash2, FiCopy, FiChevronUp, FiChevronDown, FiFilter, FiTerminal } from 'react-icons/fi';

// Log entry interface
interface LogEntry {
  id: number;
  type: 'log' | 'info' | 'warn' | 'error' | 'network' | 'debug';
  message: string;
  timestamp: Date;
  data?: any;
}

// Network request interface
interface NetworkRequest {
  id: number;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  timestamp: Date;
  response?: any;
  error?: string;
}

// System info interface
interface SystemInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenSize: string;
  viewportSize: string;
  colorDepth: number;
  devicePixelRatio: number;
  cookiesEnabled: boolean;
  onLine: boolean;
  memory?: string;
}

// Props
interface DevConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

// Global log storage
let globalLogs: LogEntry[] = [];
let globalNetworkRequests: NetworkRequest[] = [];
let logIdCounter = 0;
let networkIdCounter = 0;

// Intercept console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

// Custom log function that adds to our store
export const devLog = (message: string, type: LogEntry['type'] = 'log', data?: any) => {
  const entry: LogEntry = {
    id: ++logIdCounter,
    type,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    timestamp: new Date(),
    data,
  };
  globalLogs.push(entry);
  
  // Keep only last 500 entries
  if (globalLogs.length > 500) {
    globalLogs = globalLogs.slice(-500);
  }
  
  // Also log to original console
  originalConsole[type === 'network' || type === 'debug' ? 'log' : type](message, data || '');
};

// Initialize console interception
export const initDevConsole = () => {
  // Intercept console methods
  console.log = (...args) => {
    devLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'log');
  };
  
  console.info = (...args) => {
    devLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'info');
  };
  
  console.warn = (...args) => {
    devLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'warn');
  };
  
  console.error = (...args) => {
    devLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'error');
  };
  
  console.debug = (...args) => {
    devLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'debug');
  };
  
  // Intercept fetch for network monitoring
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = Date.now();
    const input = args[0];
    const url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.href 
        : input.url;
    const method = (args[1]?.method || 'GET').toUpperCase();
    
    const requestId = ++networkIdCounter;
    const request: NetworkRequest = {
      id: requestId,
      method,
      url,
      timestamp: new Date(),
    };
    globalNetworkRequests.push(request);
    
    try {
      const response = await originalFetch.apply(window, args);
      const duration = Date.now() - startTime;
      
      // Update the request with response info
      const idx = globalNetworkRequests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        globalNetworkRequests[idx].status = response.status;
        globalNetworkRequests[idx].duration = duration;
      }
      
      devLog(`${method} ${url} → ${response.status} (${duration}ms)`, 'network');
      return response;
    } catch (error) {
      const idx = globalNetworkRequests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        globalNetworkRequests[idx].error = String(error);
        globalNetworkRequests[idx].status = 0;
      }
      devLog(`${method} ${url} → FAILED: ${error}`, 'error');
      throw error;
    }
  };
  
  // Keep only last 100 network requests
  if (globalNetworkRequests.length > 100) {
    globalNetworkRequests = globalNetworkRequests.slice(-100);
  }
  
  devLog('[Hushh] Developer Console Initialized', 'info');
};

// Tab types
type TabType = 'log' | 'system' | 'network' | 'element' | 'storage';
type LogFilterType = 'all' | 'log' | 'info' | 'warn' | 'error';

const DevConsole: React.FC<DevConsoleProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [logFilter, setLogFilter] = useState<LogFilterType>('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [command, setCommand] = useState('');
  const [filterText, setFilterText] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [storageData, setStorageData] = useState<{ key: string; value: string }[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Update logs periodically
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setLogs([...globalLogs]);
      setNetworkRequests([...globalNetworkRequests]);
    }, 500);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Get system info
  useEffect(() => {
    if (activeTab === 'system' && !systemInfo) {
      const info: SystemInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: window.screen.colorDepth,
        devicePixelRatio: window.devicePixelRatio,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        memory: (performance as any).memory 
          ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB`
          : 'N/A',
      };
      setSystemInfo(info);
    }
  }, [activeTab, systemInfo]);

  // Get storage data
  useEffect(() => {
    if (activeTab === 'storage') {
      const data: { key: string; value: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data.push({ key, value: localStorage.getItem(key) || '' });
        }
      }
      setStorageData(data);
    }
  }, [activeTab]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'all' && log.type !== logFilter) return false;
    if (filterText && !log.message.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  // Execute command
  const executeCommand = useCallback(() => {
    if (!command.trim()) return;
    
    try {
      devLog(`> ${command}`, 'debug');
      const result = eval(command);
      devLog(`← ${JSON.stringify(result)}`, 'info');
    } catch (error) {
      devLog(`Error: ${error}`, 'error');
    }
    
    setCommand('');
  }, [command]);

  // Clear logs
  const clearLogs = () => {
    globalLogs = [];
    setLogs([]);
  };

  // Scroll to top/bottom
  const scrollToTop = () => {
    logContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    logContainerRef.current?.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
  };

  // Copy log
  const copyLog = (message: string) => {
    navigator.clipboard.writeText(message);
    devLog('[Hushh] Copied to clipboard', 'info');
  };

  // Log type colors
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'red.400';
      case 'warn': return 'yellow.400';
      case 'info': return 'cyan.400';
      case 'network': return 'purple.400';
      case 'debug': return 'gray.400';
      default: return 'white';
    }
  };

  // Log type badge colors
  const getBadgeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'red';
      case 'warn': return 'yellow';
      case 'info': return 'cyan';
      case 'network': return 'purple';
      case 'debug': return 'gray';
      default: return 'gray';
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      height="60vh"
      bg="gray.900"
      borderTop="2px solid"
      borderColor="cyan.500"
      zIndex={10000}
      display="flex"
      flexDirection="column"
      fontFamily="'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace"
      fontSize="13px"
    >
      {/* Header Tabs */}
      <Flex 
        bg="gray.800" 
        borderBottom="1px solid" 
        borderColor="gray.700"
        align="center"
        px={2}
      >
        {/* Main Tabs */}
        {(['log', 'system', 'network', 'element', 'storage'] as TabType[]).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant="ghost"
            color={activeTab === tab ? 'cyan.400' : 'gray.400'}
            bg={activeTab === tab ? 'gray.700' : 'transparent'}
            borderRadius="0"
            borderBottom={activeTab === tab ? '2px solid' : '2px solid transparent'}
            borderColor={activeTab === tab ? 'cyan.400' : 'transparent'}
            onClick={() => setActiveTab(tab)}
            textTransform="capitalize"
            fontWeight={activeTab === tab ? '600' : '400'}
            _hover={{ bg: 'gray.700', color: 'white' }}
            px={4}
            py={3}
          >
            {tab === 'log' ? 'Log' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
        
        {/* Spacer */}
        <Box flex="1" />
        
        {/* Close Button */}
        <IconButton
          aria-label="Close"
          icon={<FiX />}
          size="sm"
          variant="ghost"
          color="gray.400"
          onClick={onClose}
          _hover={{ bg: 'gray.700', color: 'white' }}
        />
      </Flex>

      {/* Sub-tabs for Log */}
      {activeTab === 'log' && (
        <Flex 
          bg="gray.850" 
          borderBottom="1px solid" 
          borderColor="gray.700"
          px={2}
          py={1}
        >
          {(['all', 'log', 'info', 'warn', 'error'] as LogFilterType[]).map((filter) => (
            <Button
              key={filter}
              size="xs"
              variant="ghost"
              color={logFilter === filter ? 'cyan.400' : 'gray.400'}
              bg={logFilter === filter ? 'gray.700' : 'transparent'}
              borderRadius="md"
              onClick={() => setLogFilter(filter)}
              textTransform="capitalize"
              fontWeight={logFilter === filter ? '600' : '400'}
              _hover={{ bg: 'gray.700' }}
              px={3}
              mr={1}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </Flex>
      )}

      {/* Content Area */}
      <Box 
        ref={logContainerRef}
        flex="1" 
        overflowY="auto" 
        p={2}
        css={{
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: '#1a202c' },
          '&::-webkit-scrollbar-thumb': { background: '#4a5568', borderRadius: '4px' },
        }}
      >
        {/* Log Tab */}
        {activeTab === 'log' && (
          <>
            {filteredLogs.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No logs yet. Console messages will appear here.
              </Text>
            ) : (
              filteredLogs.map((log) => (
                <Flex
                  key={log.id}
                  py={1}
                  px={2}
                  borderBottom="1px solid"
                  borderColor="gray.800"
                  _hover={{ bg: 'gray.800' }}
                  align="flex-start"
                  gap={2}
                >
                  <Text color="gray.500" fontSize="11px" whiteSpace="nowrap">
                    {log.timestamp.toLocaleTimeString()}
                  </Text>
                  <Badge colorScheme={getBadgeColor(log.type)} fontSize="10px" px={1}>
                    {log.type.toUpperCase()}
                  </Badge>
                  <Text 
                    color={getLogColor(log.type)} 
                    flex="1" 
                    wordBreak="break-word"
                    whiteSpace="pre-wrap"
                  >
                    {log.message}
                  </Text>
                  <IconButton
                    aria-label="Copy"
                    icon={<FiCopy />}
                    size="xs"
                    variant="ghost"
                    color="gray.500"
                    onClick={() => copyLog(log.message)}
                    _hover={{ color: 'white' }}
                  />
                </Flex>
              ))
            )}
          </>
        )}

        {/* System Tab */}
        {activeTab === 'system' && systemInfo && (
          <Box>
            {Object.entries(systemInfo).map(([key, value]) => (
              <Flex
                key={key}
                py={2}
                px={2}
                borderBottom="1px solid"
                borderColor="gray.800"
                _hover={{ bg: 'gray.800' }}
              >
                <Text color="cyan.400" fontWeight="500" width="180px" textTransform="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text color="white" flex="1" wordBreak="break-word">
                  {String(value)}
                </Text>
                <IconButton
                  aria-label="Copy"
                  icon={<FiCopy />}
                  size="xs"
                  variant="ghost"
                  color="gray.500"
                  onClick={() => copyLog(String(value))}
                  _hover={{ color: 'white' }}
                />
              </Flex>
            ))}
          </Box>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <>
            {networkRequests.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No network requests yet. API calls will appear here.
              </Text>
            ) : (
              networkRequests.slice().reverse().map((req) => (
                <Flex
                  key={req.id}
                  py={2}
                  px={2}
                  borderBottom="1px solid"
                  borderColor="gray.800"
                  _hover={{ bg: 'gray.800' }}
                  align="flex-start"
                  gap={2}
                >
                  <Text color="gray.500" fontSize="11px" whiteSpace="nowrap">
                    {req.timestamp.toLocaleTimeString()}
                  </Text>
                  <Badge 
                    colorScheme={req.method === 'GET' ? 'green' : req.method === 'POST' ? 'blue' : 'orange'} 
                    fontSize="10px" 
                    px={1}
                  >
                    {req.method}
                  </Badge>
                  <Badge 
                    colorScheme={
                      !req.status ? 'gray' :
                      req.status >= 200 && req.status < 300 ? 'green' :
                      req.status >= 400 ? 'red' : 'yellow'
                    } 
                    fontSize="10px" 
                    px={1}
                  >
                    {req.status || 'pending'}
                  </Badge>
                  <Text 
                    color="white" 
                    flex="1" 
                    wordBreak="break-word"
                    fontSize="12px"
                  >
                    {req.url}
                  </Text>
                  {req.duration && (
                    <Text color="gray.400" fontSize="11px">
                      {req.duration}ms
                    </Text>
                  )}
                  <IconButton
                    aria-label="Copy"
                    icon={<FiCopy />}
                    size="xs"
                    variant="ghost"
                    color="gray.500"
                    onClick={() => copyLog(req.url)}
                    _hover={{ color: 'white' }}
                  />
                </Flex>
              ))
            )}
          </>
        )}

        {/* Element Tab */}
        {activeTab === 'element' && (
          <Box>
            <Text color="gray.400" mb={2}>
              Document Structure (simplified):
            </Text>
            <Box bg="gray.800" p={3} borderRadius="md" fontFamily="monospace" fontSize="12px">
              <Text color="purple.400">{'<!DOCTYPE html>'}</Text>
              <Text color="cyan.400" ml={2}>{'<html>'}</Text>
              <Text color="cyan.400" ml={4}>{'<head>'}</Text>
              <Text color="gray.400" ml={6}>{`<title>${document.title}</title>`}</Text>
              <Text color="cyan.400" ml={4}>{'</head>'}</Text>
              <Text color="cyan.400" ml={4}>{'<body>'}</Text>
              <Text color="gray.400" ml={6}>{`<div id="root"> ... (${document.querySelectorAll('*').length} elements)</div>`}</Text>
              <Text color="cyan.400" ml={4}>{'</body>'}</Text>
              <Text color="cyan.400" ml={2}>{'</html>'}</Text>
            </Box>
            <Flex mt={4} gap={4} flexWrap="wrap">
              <Box bg="gray.800" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="gray.400" mb={1}>Total Elements</Text>
                <Text color="cyan.400" fontSize="2xl" fontWeight="bold">
                  {document.querySelectorAll('*').length}
                </Text>
              </Box>
              <Box bg="gray.800" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="gray.400" mb={1}>DOM Depth</Text>
                <Text color="cyan.400" fontSize="2xl" fontWeight="bold">
                  ~{Math.floor(Math.log2(document.querySelectorAll('*').length))}
                </Text>
              </Box>
              <Box bg="gray.800" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="gray.400" mb={1}>Scripts</Text>
                <Text color="cyan.400" fontSize="2xl" fontWeight="bold">
                  {document.querySelectorAll('script').length}
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <>
            <Text color="gray.400" mb={2} px={2}>
              LocalStorage ({storageData.length} items)
            </Text>
            {storageData.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No localStorage data.
              </Text>
            ) : (
              storageData.map((item) => (
                <Flex
                  key={item.key}
                  py={2}
                  px={2}
                  borderBottom="1px solid"
                  borderColor="gray.800"
                  _hover={{ bg: 'gray.800' }}
                  align="flex-start"
                  gap={2}
                >
                  <Text color="cyan.400" fontWeight="500" minW="150px">
                    {item.key}
                  </Text>
                  <Text 
                    color="white" 
                    flex="1" 
                    wordBreak="break-word"
                    fontSize="12px"
                    maxH="100px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {item.value.length > 200 ? item.value.substring(0, 200) + '...' : item.value}
                  </Text>
                  <IconButton
                    aria-label="Copy"
                    icon={<FiCopy />}
                    size="xs"
                    variant="ghost"
                    color="gray.500"
                    onClick={() => copyLog(item.value)}
                    _hover={{ color: 'white' }}
                  />
                </Flex>
              ))
            )}
          </>
        )}
      </Box>

      {/* Footer with Command Input */}
      <Box borderTop="1px solid" borderColor="gray.700" bg="gray.800">
        {/* Filter */}
        {activeTab === 'log' && (
          <Flex px={2} py={1} borderBottom="1px solid" borderColor="gray.700" align="center">
            <FiFilter style={{ color: '#718096', marginRight: '8px' }} />
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="filter..."
              size="sm"
              variant="unstyled"
              color="white"
              _placeholder={{ color: 'gray.500' }}
            />
            <Button size="xs" colorScheme="cyan" variant="ghost" onClick={() => setFilterText('')}>
              Filter
            </Button>
          </Flex>
        )}
        
        {/* Command Input */}
        <Flex px={2} py={2} align="center">
          <FiTerminal style={{ color: '#718096', marginRight: '8px' }} />
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="command..."
            size="sm"
            variant="unstyled"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            flex="1"
          />
          <Button size="xs" colorScheme="cyan" onClick={executeCommand}>
            OK
          </Button>
        </Flex>
        
        {/* Action Buttons */}
        <Flex px={2} py={2} borderTop="1px solid" borderColor="gray.700" justify="space-around">
          <Button 
            size="sm" 
            variant="ghost" 
            color="gray.400" 
            leftIcon={<FiTrash2 />}
            onClick={clearLogs}
          >
            Clear
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            color="gray.400" 
            leftIcon={<FiChevronUp />}
            onClick={scrollToTop}
          >
            Top
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            color="gray.400" 
            leftIcon={<FiChevronDown />}
            onClick={scrollToBottom}
          >
            Bottom
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            color="gray.400" 
            leftIcon={<FiX />}
            onClick={onClose}
          >
            Hide
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default DevConsole;
export { globalLogs, globalNetworkRequests };
