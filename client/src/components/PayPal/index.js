export default function PayPal({amount, onSuccess}) {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <h4 style={{color: '#ff6b6b', marginBottom: '10px'}}>🔄 Đang cập nhật</h4>
      <p style={{color: '#666', marginBottom: '10px'}}>
        Tính năng thanh toán bằng PayPal đang được phát triển.
      </p>
      <p style={{color: '#999', fontSize: '14px'}}>
        Vui lòng sử dụng các phương thức thanh toán khác (MoMo, Chuyển khoản, v.v.).
      </p>
    </div>
  );
}
