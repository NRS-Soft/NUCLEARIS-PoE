// documents.js
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';
import axios from 'axios';
import Header from '../components/header';
import Footer from '../components/footer';
import { UserContext } from '../context/userContext';
import { Title, Wrap, Scroll } from '../Archive/components/components.js';
import {
  Table,
  Row,
  Col2,
  Col3
} from '../Archive/components/tableComponents.js';
import { ReactComponent as Eye } from '../img/eye.svg';
import DocImg from '../img/documentSample.pdf';

const FlexWrap = styled.div`
  display: flex;
  height: 100%;
`;
const FlexWrapRight = styled(FlexWrap)`
  float: right;
  padding-right: 20px;
  height: auto;
`;

const DocImgHolder = styled.iframe`
  float: right;
  margin-right: 20px;
  margin-bottom: 50px;
  width: 800px;
  height: 600px;
`;

const Left = styled.div`
  padding: 0;
  width: 60%;
  background: #fff;
  min-width: 461px;
  ${Row} {
    padding: 4px 60px;
  }
`;

const Right = styled(Scroll)`
  padding: 30px 40px;
  width: 40%;
  background: #ccc;
  min-width: 307px;
  text-align: left;
  box-sizing: border-box;
`;

const ResumenTit = styled(Title)`
  color: #8c6239;
  font-size: 16px;
  line-height: 16px;
  margin: 10px 0;
`;

const ProcesosTit = styled(ResumenTit)`
  color: #333;
  margin-top: 50px;
`;

const RowCenter = styled(Row)`
  text-align: center;
  & div {
    font-weight: 100;
  }
`;

const Step = styled.div`
  text-align: center;
  margin: 0 auto;
  color: #8c6239;
  font-weight: 100;
  width: 40px;
  height: 40px;
  border: 1px solid #8c6239;
  border-radius: 50%;
  line-height: 40px;
  background: transparent;

  &.check {
    background: #8c6239;
  }
  &.check::after {
    content: '';
    color: #fff;
    position: absolute;
    margin-left: -10px;
    margin-top: 13px;
    width: 14px;
    height: 8px;
    border-bottom: solid 1px currentColor;
    border-left: solid 1px currentColor;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
`;

const Nota = styled.div`
  color: #333;
  font-size: 13px;
  line-height: 16px;
  margin: 10px 0;
`;

const Fecha = styled.div`
  color: #8c6239;
  font-size: 11px;
  line-height: 16px;
`;

function Documents() {
  const { process, hash } = useParams();

  useEffect(() => {
    axios({
      method: 'get',
      url: '/api/doc/getOne?contract=' + process + '&hash=' + hash,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(({ data }) => {
      console.log(data);
    });
  }, []);

  return (
    <>
      <Header />
      <Wrap>
        <FlexWrap>
          <Left>
            <FlexWrapRight>
              <Title>DOCUMENTO </Title>
            </FlexWrapRight>
            <Table>
              <DocImgHolder src={DocImg} />
            </Table>
          </Left>
          <Right>
            <ResumenTit>DETALLES DE DOCUMENTO</ResumenTit>
            <Row>
              <Col2 className="color">NOMBRE</Col2>
              <Col2 className="bold">Certificado de barra</Col2>
            </Row>
            <Row>
              <Col2 className="color">USUARIO</Col2>
              <Col2 className="bold">BGH.nrs</Col2>
            </Row>
            <Row>
              <Col2 className="color">HASH</Col2>
              <Col2 className="bold">0xec36349346478eb38358465</Col2>
            </Row>
            <ProcesosTit>PROCESO DE CERTIFICACIÓN</ProcesosTit>
            <RowCenter>
              <Col3>
                <Step className="check">1</Step>
              </Col3>
              <Col3>
                <Step>2</Step>
              </Col3>
              <Col3>
                <Step>3</Step>
              </Col3>
            </RowCenter>
            <RowCenter>
              <Col3>Documento subido</Col3>
              <Col3>Transferencia emitida</Col3>
              <Col3>Guardado en Blockchain</Col3>
            </RowCenter>
            <ProcesosTit>OBSERVACIONES</ProcesosTit>
            <Nota>
              Se encontró una fe de erratas en la composición química
              <Fecha>11/09/2019 / BGH</Fecha>
            </Nota>
          </Right>
        </FlexWrap>
      </Wrap>
      <Footer />
    </>
  );
}
export default Documents;
