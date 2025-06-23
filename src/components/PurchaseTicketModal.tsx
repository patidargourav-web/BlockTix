
import { useState, useEffect } from 'react';
import { useCDPWallet } from '@/providers/CDPWalletProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ticket, Loader2, Coins, Gift, Bot, Zap, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { agentKitPricing } from '@/services/AgentKitPricing';
import RealtimeTicketCounter from './RealtimeTicketCounter';

const NETWORK_FEE = 0.001;

// Chain-specific token configurations
const CHAIN_TOKENS: Record<number, { name: string; symbol: string; priceMultiplier: number }> = {
  1: { name: 'Ethereum', symbol: 'ETH', priceMultiplier: 1 }, // Ethereum mainnet
  137: { name: 'Polygon', symbol: 'MATIC', priceMultiplier: 0.5 }, // Polygon is cheaper
  42161: { name: 'Arbitrum', symbol: 'ETH', priceMultiplier: 0.8 }, // Arbitrum L2
  10: { name: 'Optimism', symbol: 'ETH', priceMultiplier: 0.8 }, // Optimism L2
  8453: { name: 'Base', symbol: 'ETH', priceMultiplier: 0.7 }, // Base L2
  43114: { name: 'Avalanche', symbol: 'AVAX', priceMultiplier: 0.3 }, // Avalanche
};

interface PurchaseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  selectedTicketType: number;
  ticketQuantity: number;
}

type PaymentMethod = 'free' | 'ethereum';

const PurchaseTicketModal = ({
  isOpen,
  onClose,
  event,
  selectedTicketType,
  ticketQuantity,
}: PurchaseTicketModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('free');
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [isLoadingAiPrice, setIsLoadingAiPrice] = useState(false);
  const { accounts, isConnected, chainId } = useCDPWallet();
  const { user } = useAuth();
  const { purchaseTicketMutation } = useTickets();
  const navigate = useNavigate();

  const ticketType = event?.ticketTypes?.[selectedTicketType] || {
    name: 'General Admission',
    price: event?.price || 0
  };

  // Check if the event is free (price is 0)
  const isEventFree = parseFloat(event?.price || '0') === 0;

  // Check if tickets are still available
  const availableTickets = event ? event.total_tickets - event.tickets_sold : 0;
  const isEventSoldOut = availableTickets <= 0;
  const isQuantityExceedsAvailable = ticketQuantity > availableTickets;

  // Get current chain token info
  const getCurrentChainToken = () => {
    return chainId ? CHAIN_TOKENS[chainId] || { name: 'Unknown', symbol: 'ETH', priceMultiplier: 1 } : { name: 'Ethereum', symbol: 'ETH', priceMultiplier: 1 };
  };

  const chainToken = getCurrentChainToken();

  useEffect(() => {
    if (isOpen && event?.id) {
      // Set default payment method based on event price
      if (isEventFree) {
        setPaymentMethod('free');
      } else {
        setPaymentMethod('ethereum');
        fetchAiPricing();
      }
    }
  }, [isOpen, event?.id, isEventFree]);

  const fetchAiPricing = async () => {
    if (isEventFree) return; // Don't fetch AI pricing for free events
    
    setIsLoadingAiPrice(true);
    try {
      const recommendation = await agentKitPricing.calculateDynamicPricing(event.id);
      setAiPrice(recommendation.suggestedPrice);
      console.log('AgentKit: AI pricing fetched for modal', recommendation);
    } catch (error) {
      console.error('AgentKit: Failed to fetch AI pricing', error);
    } finally {
      setIsLoadingAiPrice(false);
    }
  };

  const getEffectivePrice = () => {
    if (isEventFree) return 0;
    const basePrice = aiPrice || parseFloat(ticketType.price) || 0;
    // Apply chain-specific price multiplier
    return basePrice * chainToken.priceMultiplier;
  };
  
  const basePrice = getEffectivePrice() * ticketQuantity;
  const totalPriceInToken = basePrice + (NETWORK_FEE * chainToken.priceMultiplier);

  const getChainName = () => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      43114: 'Avalanche',
    };
    return chainId ? chainNames[chainId] || `Chain ${chainId}` : 'Unknown';
  };

  const handlePurchase = async () => {
    if (!user) {
      toast('Please sign in to purchase tickets');
      navigate('/auth');
      onClose();
      return;
    }

    if (isEventSoldOut || isQuantityExceedsAvailable) {
      toast('Not enough tickets available', {
        description: `Only ${availableTickets} tickets remaining`,
      });
      return;
    }

    if (paymentMethod === 'ethereum' && (!isConnected || !accounts.length)) {
      toast('Please connect your CDP wallet to purchase with crypto');
      return;
    }

    if (!ticketType) {
      toast('Invalid ticket type', { 
        description: 'Please select a valid ticket type',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a small placeholder image buffer
      const fallbackBuffer = new ArrayBuffer(100);
      const view = new Uint8Array(fallbackBuffer);
      for (let i = 0; i < 100; i++) {
        view[i] = i % 256;
      }
      
      let imageBuffer: ArrayBuffer = fallbackBuffer;
      
      if (event.image_url) {
        try {
          console.log("Fetching image from:", event.image_url);
          const response = await fetch(event.image_url);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            if (buffer && buffer.byteLength > 0) {
              imageBuffer = buffer;
              console.log("Successfully loaded image buffer:", buffer.byteLength, "bytes");
            }
          }
        } catch (imageError) {
          console.error("Error loading image, using fallback:", imageError);
        }
      }

      // Determine price and currency based on payment method and event price
      let finalPrice = 0;
      let currency: 'ETH' | 'FREE' | 'MATIC' | 'AVAX' = 'FREE';
      
      if (isEventFree || paymentMethod === 'free') {
        finalPrice = 0;
        currency = 'FREE';
      } else if (paymentMethod === 'ethereum') {
        finalPrice = totalPriceInToken;
        currency = chainToken.symbol as 'ETH' | 'MATIC' | 'AVAX';
      }

      console.log('Purchase details:', {
        paymentMethod,
        finalPrice,
        currency,
        ticketType: ticketType.name,
        chainId,
        chainToken,
        wallet: accounts[0],
        isEventFree
      });
      
      await purchaseTicketMutation.mutateAsync({
        eventId: event.id,
        eventDetails: {
          title: event.title || 'Event',
          date: event.date || new Date().toISOString(),
          location: event.location || 'Virtual',
          ticketType: ticketType.name || 'General Admission',
          tickets_sold: event.tickets_sold || 0,
        },
        ticketType: ticketType.name || 'General Admission',
        price: finalPrice,
        currency: currency,
        imageBuffer,
        paymentMethod: isEventFree ? 'free' : paymentMethod
      });
      
      const paymentMethodText = isEventFree || paymentMethod === 'free' ? 'for free' : 
                               `with ${currency} on ${getChainName()}`;
      
      toast(`Ticket purchased successfully ${paymentMethodText}!`, {
        description: 'Your ticket has been added to your collection.'
      });
      
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error in purchase process:', error);
      toast('Failed to purchase ticket', {
        description: error.message || 'An unexpected error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentButtonText = () => {
    if (isEventSoldOut) return 'Sold Out';
    if (isQuantityExceedsAvailable) return `Only ${availableTickets} Available`;
    if (isEventFree) return 'Get Free Ticket';
    if (paymentMethod === 'free') return 'Get Free Ticket';
    return `Pay with ${chainToken.symbol} on ${getChainName()}`;
  };

  const getPaymentIcon = () => {
    if (isEventSoldOut || isQuantityExceedsAvailable) return <AlertTriangle className="h-4 w-4 mr-2" />;
    if (isEventFree || paymentMethod === 'free') return <Gift className="h-4 w-4 mr-2" />;
    return <Coins className="h-4 w-4 mr-2" />;
  };

  const getPaymentButtonColor = () => {
    if (isEventSoldOut || isQuantityExceedsAvailable) return 'bg-gray-500 hover:bg-gray-600';
    if (isEventFree || paymentMethod === 'free') return 'bg-green-600 hover:bg-green-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const isPurchaseDisabled = isProcessing || isEventSoldOut || isQuantityExceedsAvailable || (!isEventFree && paymentMethod === 'ethereum' && !isConnected);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Ticket</DialogTitle>
          <DialogDescription>
            You're about to purchase {ticketQuantity} {ticketType?.name} ticket{ticketQuantity > 1 ? 's' : ''} for {event?.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Real-time ticket counter */}
          <div className="bg-card border border-border rounded-lg p-4">
            <RealtimeTicketCounter 
              totalTickets={event?.total_tickets || 0}
              ticketsSold={event?.tickets_sold || 0}
              className="justify-center"
            />
          </div>

          {/* Show warning if not enough tickets */}
          {isQuantityExceedsAvailable && !isEventSoldOut && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                Limited Availability
              </div>
              <p className="text-yellow-600 text-xs mt-1">
                Only {availableTickets} tickets remaining. Please adjust your quantity.
              </p>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Type:</span>
              <span>{ticketType?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span>{ticketQuantity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price per ticket:</span>
              <div className="flex items-center gap-2">
                {isEventFree ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Gift className="w-3 h-3 mr-1" />
                    FREE
                  </Badge>
                ) : (
                  <>
                    {isLoadingAiPrice ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">AI analyzing...</span>
                      </div>
                    ) : aiPrice ? (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Bot className="w-3 h-3 mr-1" />
                        AI: {getEffectivePrice().toFixed(4)} {chainToken.symbol}
                      </Badge>
                    ) : (
                      <span>{getEffectivePrice().toFixed(4)} {chainToken.symbol}</span>
                    )}
                  </>
                )}
              </div>
            </div>
            {!isEventFree && isConnected && chainId && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Network:</span>
                <Badge variant="outline">
                  {chainToken.name} ({chainToken.symbol})
                </Badge>
              </div>
            )}
          </div>

          {!isEventFree && aiPrice && aiPrice !== parseFloat(ticketType?.price || '0') && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-700 text-sm font-medium">
                <Zap className="w-4 h-4" />
                AgentKit AI Pricing Active
              </div>
              <p className="text-purple-600 text-xs mt-1">
                Price optimized based on real-time demand analysis and chain economics
              </p>
            </div>
          )}

          {/* Payment method selection - only show if event is not free and tickets are available */}
          {!isEventFree && !isEventSoldOut && !isQuantityExceedsAvailable && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Payment Method:</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="ethereum" id="ethereum" />
                  <Label htmlFor="ethereum" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 mr-2 text-blue-600" />
                        <span>CDP Wallet ({chainToken.name})</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{totalPriceInToken.toFixed(4)} {chainToken.symbol}</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Show free event message */}
          {isEventFree && !isEventSoldOut && (
            <div className="text-sm text-muted-foreground">
              <p>This event is completely free! You'll receive your ticket instantly in your dashboard.</p>
            </div>
          )}

          {/* Show payment method specific messages for paid events */}
          {!isEventFree && paymentMethod === 'ethereum' && !isEventSoldOut && (
            <div className="text-sm text-muted-foreground">
              <p>This will process payment through your connected CDP wallet on {getChainName()} using {chainToken.symbol}. Multi-chain support available.</p>
              {!isConnected && (
                <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 text-sm">
                  Please connect your CDP wallet before proceeding with crypto payment.
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            className={getPaymentButtonColor()}
            disabled={isPurchaseDisabled}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {getPaymentIcon()}
                {getPaymentButtonText()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseTicketModal;
