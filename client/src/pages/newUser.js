// newProvider.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import {
  Title,
  Label,
  Input,
  Select,
  Button,
  Wrap
} from '../components/components.js';
import { Top, Form, FormWrap } from '../components/form.js';
import Modal from '../components/Modal';
import Header from '../components/header';
import Footer from '../components/footer';
import Spinner from 'react-bootstrap/Spinner';

export default function NewUser() {
  const { getCurrentUser } = useContext(UserContext);
  const [form, setForm] = useState([]);
  const [event, setEvent] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleInput(e) {
    e.persist();
    setForm(form => ({ ...form, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const user = getCurrentUser();
    axios({
      method: 'post',
      url: '/api/user/',
      data: {
        ...form,
        email: user.userEmail
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(result => {
        if (result.data.error) {
        } else {
          setLoading(false);
          setEvent(result.data);
          setModalShow(true);
        }
      })
      .catch(e => {
        setEvent();
      });
  }

  return (
    <>
      <Top>
        <Title>
          NUEVO
          <br />
          USUARIO
        </Title>
      </Top>
      <FormWrap>
        <Form>
          <Label>NOMBRE</Label>
          <Input name="newUserName" onChange={handleInput}></Input>
          <Label>MAIL</Label>
          <Input type="mail" name="newUserEmail" onChange={handleInput}></Input>
          <Label>TIPO</Label>
          <Select name="userType" onChange={handleInput}>
            <option>Select one...</option>
            <option value="1">Proveedor</option>
            <option value="0">Cliente</option>
          </Select>
          <Button className="submit" onClick={handleSubmit}>
            {loading ? (
              <Spinner animation="border" role="status" size="sm"></Spinner>
            ) : (
              'CREAR'
            )}
          </Button>
          {modalShow && (
            <Modal
              title="Nuevo usuario creado"
              show={modalShow}
              setShow={setModalShow}
            >
              <p style={{ textDecoration: 'underline' }}>Detalles:</p>
              <ul>
                <li>Nombre: {form.newUserName}</li>
                <li>Correo electronico: {form.newUserEmail}</li>
              </ul>
            </Modal>
          )}
        </Form>
      </FormWrap>
      <Footer />
    </>
  );
}
