
import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AccountSideBar from "./components/SideBar/AccountSideBar";
  
import styles from "./Layout.module.css"

function AccountLayout() {

  return (
    <div className="main">
      <Container>
        <Row>
          <Col xl={3}>
            <AccountSideBar />
          </Col>
          <Col xl={9}>
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