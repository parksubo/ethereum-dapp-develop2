import "./css/bootstrap.min.css";
import "./css/style.css";

import React, {Component} from "react";
import {Container, Row, Col, Card, Image} from 'react-bootstrap';
import * as bootstrap from 'react-bootstrap';

class CoinFlip extends Component {
    // 생성자
    constructor(props) {
        super (props);

        // handleClickCoin 함수에서 this에 접근 할 수 없기 때문에 생성자에서 바인드 해줘야 함
        this.handleClickCoin = this.handleClickCoin.bind(this);
    }

    // 컴포넌트 상태
    state = {
        web3: null,
        accounts: null,
        contract: null,

        value: 0,
        checked: 0, // radio button
        houseBalance: 0,
        show: false,
        reveal: 0,
        rewards: 0,
        txList: []
    };

    // onClick 함수 발동시 수행할 함수 작성
    handleClickCoin(e) {
        if(this.state.checked == 0) {   // toggle
            // 클릭한 요소의 id가 Heads 인 경우 checked: 2 (10(2진법)), Tails 인 경우 checked: 1 (01(2진법))
            if(e.target.id == "Heads") {
                this.setState({checked: 2});
            }
            else if(e.target.id == "Tails") {
                this.setState({checked: 1});
            }
        }
        // 체크가 이미 되어있다면 toggle 해제
        else {
            this.setState({checked: 0});
        }
    }

    render() {
        let coin_h = "head.png";
        let coin_t = "tail.png";

        // using JSX
        let coin =
            <div>
                <Image class="two-image-align" src={coin_h} id="Heads" onClick={this.handleClickCoin} className="img-coin"/>
                <Image class="two-image-align" src={coin_t} id="Tails" onClick={this.handleClickCoin} className="img-coin"/>
            </div>


        return (
            // 화면 크기따라 컨테이너 달라짐
            <Container fluid={true}>
                <Row className="show-grid">
                    <Col md={5}>
                    <div class="card">
                        <div class="image-box">
                            {coin}
                        </div>
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
                    <div class="card">
                        <form action="" name ="checkBox" method ="POST">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" checked={this.state.checked === 2} value="" id="checkHead"/>
                              <label class="form-check-label" for="flexCheckDefault">
                                Head
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" checked={this.state.checked === 1} value="" id="checkTail" />
                              <label class="form-check-label" for="flexCheckDefault">
                                Tail
                              </label>
                            </div>
                        </form>
                    </div>
                    </Col>
                    <Col md={5}>

                    </Col>
                </Row>
            </Container>
        );
    }
}


// export 해야 사용 가능
export default CoinFlip;
