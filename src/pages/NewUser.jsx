import React, { useState } from 'react';
import { Title, Label, Button, Input } from '../styles/components';
import { Top, Form, FormWrap, ErrorForm } from '../styles/form';
import Footer from '../components/Footer';
import I18n from '../i18n';
import { useForm } from 'react-hook-form';
import { UserSchema } from '../validationSchemas/index';
import useWeb3 from '../hooks/useWeb3';
import LoggedHeader from '../components/LoggedHeader';
import RSKLink from '../components/RSKLink';
import { Link } from 'react-router-dom';

export default function NewUser() {
  const [web3, contract] = useWeb3();
  const [txHash, setTxHash] = useState(undefined);

  const { register, handleSubmit, errors } = useForm({
    validationSchema: UserSchema,
  });

  function onSubmit(data) {
    if (contract && web3)
      web3.eth.getCoinbase().then((msgSender) =>
        contract.methods
          .createUser(
            data.newUserType,
            data.newUserAddress,
            web3.utils.asciiToHex(data.newUserName)
          )
          .send({ from: msgSender })
          .on('transactionHash', (txHash) => setTxHash(txHash))
      );
  }

  return (
    <>
      <LoggedHeader />
      <Top>
        <Title>
          <I18n t="forms.newUser" />
        </Title>
      </Top>
      <FormWrap>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {txHash ? (
            <>
              <Label>EXITO</Label>
              <p>
                Transaccion fue enviada con exito a la Blockchain, puede tardar
                varios minutos en ser confirmada.
              </p>
              <div>
                Transaction Hash: <RSKLink hash={txHash} testnet type="tx" />
              </div>
              <Button as={Link} to="/users">
                VER USUARIOS
              </Button>
            </>
          ) : (
            <>
              <Label>
                <I18n t="forms.name" />
              </Label>
              <Input type="text" ref={register} name="newUserName"></Input>
              <ErrorForm>
                {errors.newUserName && errors.newUserName.message}
              </ErrorForm>
              <Label>
                <I18n t="forms.address" />
              </Label>
              <Input type="text" ref={register} name="newUserAddress"></Input>
              <ErrorForm>
                {errors.newUserAddress && errors.newUserAddress.message}
              </ErrorForm>
              <Label>
                <I18n t="forms.type" />
              </Label>
              <div>
                <Input
                  style={{ width: '20px', height: 'unset' }}
                  type="radio"
                  ref={register}
                  name="newUserType"
                  value="1"
                  id="client"
                ></Input>
                <label htmlFor="client">
                  {' '}
                  <I18n t="forms.client" />
                </label>
              </div>
              <div>
                <Input
                  style={{ width: '20px', height: 'unset' }}
                  type="radio"
                  ref={register}
                  name="newUserType"
                  value="2"
                  id="supplier"
                ></Input>
                <label htmlFor="supplier">
                  {' '}
                  <I18n t="forms.supplier" />
                </label>
              </div>
              <ErrorForm>
                {errors.newUserAddress && errors.newUserAddress.message}
              </ErrorForm>
              <Button type="submit">CREAR</Button>
            </>
          )}
        </Form>
      </FormWrap>
      <Footer />
    </>
  );
}