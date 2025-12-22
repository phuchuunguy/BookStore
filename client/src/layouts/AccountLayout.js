
import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AccountSideBar from "./components/SideBar/AccountSideBar";
  
import styles from "./Layout.module.css"

function AccountLayout() {

  return (
    <div className="main">
      <Container>
        <Row className="g-4">
        <Col xl={2} lg={3} style={{ flex: '0 0 20%', maxWidth: '20%' }}> 
          <AccountSideBar />
        </Col>

        <Col xl={9} lg={8}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Col>
      </Row>
      </Container>
    </div>
  );
}

export default AccountLayout