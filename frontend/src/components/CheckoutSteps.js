import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps mx-auto w-full max-w-screen-xl">
      <Col className={props.step1 ? 'active' : ''}>Đăng nhập</Col>
      <Col className={props.step2 ? 'active' : ''}>Đơn hàng</Col>
      <Col className={props.step3 ? 'active' : ''}>Phương thức</Col>
      <Col className={props.step4 ? 'active' : ''}>Đặt hàng</Col>
    </Row>
  );
}
