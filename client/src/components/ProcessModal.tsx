// modal.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Scroll } from '../styles/components';
import { Row, HeadRow, Col4 } from '../styles/tableComponents';
import { ReactComponent as Eye } from '../img/eye.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { useAsync } from '../hooks/useAsync';

const Backdrop = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: transparent;
  z-index: 999999;
`;

const ModalWrap = styled.div`
  width: 540px;
  height: 350px;
  position: fixed;
  top: 320px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #333;
  z-index: 999999;
`;

const ModalTop = styled.div`
  width: 100%;
  height: 140px;
  color: #fff;
  padding: 30px 20px 10px 50px;
  box-sizing: border-box;
`;

const ModalBottom = styled.div`
  width: 100%;
  height: 210px;
  background: #999;
  color: #333;
  padding: 5px 20px 10px 30px;
  box-sizing: border-box;
  ${HeadRow} {
    width: calc(100% - 34px);
    margin-left: 20px;
  }
`;

const ModalTit = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
  line-height: 26px;
`;

const ModalInput = styled.input`
  font-family: 'Roboto Condensed', sans-serif;
  border: none;
  width: 190px;
  height: 23px;
  padding: 5px;
  color: #333;
  cursor: text;
  font-size: 13px;
  font-weight: 300;
  box-sizing: border-box;
  background: #e6e6e6;
  margin: 5px 0;
  &:active,
  &:focus {
    text-align: left;
  }
`;

const ModalTxt = styled.div`
  font-weight: 400;
  font-size: 11px;
  letter-spacing: 1px;
  line-height: 20px;
`;

const ModalProdName = styled.div`
  font-weight: 700;
  font-size: 23px;
  letter-spacing: 1px;
  line-height: 20px;
  margin: 3px 0;
`;

const ScrollBox130 = styled(Scroll)`
  height: 130px;
`;

interface CheckProps {
  setCheckedProcesses: any;
  id: string;
}

function Check(props: CheckProps) {
  const [checked, setChecked] = useState(false);

  function handleCheckboxChange() {
    checked === false
      ? props.setCheckedProcesses((checkedArr: string[]) => [
          ...checkedArr,
          props.id
        ])
      : props.setCheckedProcesses((checkedArr: string[]) =>
          checkedArr.filter((check: string) => check === props.id)
        );

    setChecked(!checked);
  }

  const Checkbox = styled.div`
    width: 13px;
    height: 13px;
    border: 1px solid #333;
    box-sizing: border-box;
    margin: 1px 7px 1px 0;
    background: ${(props: { checked: boolean }) =>
      props.checked ? 'background: #333' : 'background:transparent;'};
  `;

  return (
    <Checkbox
      checked={checked}
      onClick={() => {
        handleCheckboxChange();
      }}
    ></Checkbox>
  );
}

function ProcessModal({ project }: { project: { id: string; title: string } }) {
  const { register, handleSubmit, getValues } = useForm();
  const { execute, pending } = useAsync(onSubmit, false);
  const { data } = useSWR('/api/process/get', url =>
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(result => result.data)
  );

  function onSubmit() {
    return new Promise((resolve, reject) => {
      const form = getValues();
      axios({
        method: 'post',
        url: '/api/project/assignProcess',
        data: {
          ...form
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(({ data }) => resolve(data))
        .catch(e => reject(e.message));
    });
  }

  return (
    <Backdrop>
      <ModalWrap>
        <ModalTop>
          <ModalTit>AGREGAR PROCESOS</ModalTit>
          <ModalInput placeholder="BUSCAR" ref={register}></ModalInput>
          <ModalTxt>
            SELECCIONE LOS PROCESOS QUE DESEA AGREGAR AL PROYECTO
          </ModalTxt>
          <ModalProdName>{project.title}</ModalProdName>
        </ModalTop>
        <ModalBottom>
          <HeadRow>
            <Col4>NOMBRE</Col4>
            <Col4>PROVEEDOR</Col4>
            <Col4>DOCUMENTOS</Col4>
          </HeadRow>
          <ScrollBox130>
            {data?.map(
              (process: {
                processContracts: string;
                processName: string;
                supplierName: string;
              }) => (
                <Row key={process.processContracts}>
                  <Check
                    id={process.processContracts}
                    setCheckedProcesses={() => {}}
                  />
                  <Col4>{process.processName}</Col4>
                  <Col4>{process.supplierName}</Col4>
                  <Col4>
                    <Link to={'/documents/' + process.processContracts}>
                      <Eye />
                      VER DOC.
                    </Link>
                  </Col4>
                </Row>
              )
            )}
          </ScrollBox130>
          <Button disabled={pending} onClick={handleSubmit(execute)}>
            {pending ? 'LOADING' : '+ AGREGAR PROCESOS'}
          </Button>
        </ModalBottom>
      </ModalWrap>
    </Backdrop>
  );
}
export default ProcessModal;