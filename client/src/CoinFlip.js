import "./css/bootstrap.min.css";
import "./css/style.css";

import React, {Component} from "react";
import {Container, Row, Col, Card} from 'react-bootstrap';
// import Panel from 'react-bootstrap/lib/Panel';
// import Glyphicon from 'react-bootstrap/lib/Glyphicon';

class CoinFlip extends Component {
    // 생성자
    constructor(props) {
        super (props);
    }

    render() {
        return (
            // 화면 크기따라 컨테이너 달라짐
            <Container fluid={true}>
                <Row className="show-grid">
                    <Col md={5}>
                        <div class="image-box">
                            <img class="two-image-align" src="head.png" alt="" />
                            <img class="two-image-align" src="tail.png" alt="" />
                        </div>
                    </Col>
                    <Col md={5}>
                        <div class="card">
                          <div class="card-body">
                            Do CoinFlips, Go Mars!
                          </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={5}>
                        3
                    </Col>
                    <Col md={5}>
                        4
                    </Col>
                </Row>
            </Container>
        );
    }
}


// export 해야 사용 가능
export default CoinFlip;
