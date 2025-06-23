
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateQRCodeData, generateQRCodeImage, QRCodeData } from '@/utils/qrCodeGenerator';
import { useToast } from '@/components/ui/use-toast';

export const useQRCodeGeneration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateTicketQRCode = async (ticketId: string, eventId: string, attendeeId: string) => {
    try {
      console.log('Generating QR code for ticket:', ticketId);
      
      // Fetch attendee profile to get the name
      const { data: attendeeProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', attendeeId)
        .single();

      const attendeeName = attendeeProfile?.display_name || 'Unknown';
      
      // Generate QR code data with attendee name
      const qrData = generateQRCodeData(ticketId, eventId, attendeeId, attendeeName);
      
      // Generate QR code image
      const qrCodeImage = await generateQRCodeImage(qrData);
      
      // Update ticket with QR code data
      const { error } = await supabase
        .from('tickets')
        .update({
          qr_code_data: qrData as any,
          qr_code_generated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket with QR code:', error);
        throw new Error('Failed to save QR code data');
      }

      console.log('QR code generated successfully');
      return { qrData, qrCodeImage };
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const generateQRCodeMutation = useMutation({
    mutationFn: ({ ticketId, eventId, attendeeId }: { ticketId: string; eventId: string; attendeeId: string }) =>
      generateTicketQRCode(ticketId, eventId, attendeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets'] });
      toast({
        title: 'QR Code Generated',
        description: 'Your ticket QR code has been generated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'QR Code Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    generateQRCodeMutation,
  };
};
