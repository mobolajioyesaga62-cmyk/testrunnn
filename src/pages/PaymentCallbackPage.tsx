import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference');

        if (!reference) {
          setStatus('error');
          setErrorMessage('Invalid payment reference');
          return;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/verify_payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ reference }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setErrorMessage(data.error || 'Payment verification failed');
          return;
        }

        if (data.success) {
          const supabaseUrlFull = import.meta.env.VITE_SUPABASE_URL;
          const { data: orders, error } = await supabase
            .from('orders')
            .select('order_number')
            .eq('payment_reference', reference)
            .maybeSingle();

          if (orders && orders.order_number) {
            setOrderNumber(orders.order_number);
          }

          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Payment was not completed successfully');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setErrorMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <Loader size={48} className="mx-auto text-gray-400 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <CheckCircle2 size={64} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
          {orderNumber && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
            </div>
          )}
          <Button
            onClick={() => {
              if (orderNumber) {
                navigate(`/order-success/${orderNumber}`);
              } else {
                navigate('/');
              }
            }}
            fullWidth
          >
            View Order
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="text-center max-w-md">
        <AlertCircle size={64} className="mx-auto text-red-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/cart')} variant="outline" fullWidth>
            Back to Cart
          </Button>
          <Button onClick={() => navigate('/')} fullWidth>
            Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
