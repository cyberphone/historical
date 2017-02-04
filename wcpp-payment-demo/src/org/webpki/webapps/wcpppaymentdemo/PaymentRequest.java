/*
 *  Copyright 2006-2014 WebPKI.org (http://webpki.org).
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.webpki.webapps.wcpppaymentdemo;

import java.io.IOException;

import java.util.GregorianCalendar;

import org.webpki.crypto.AlgorithmPreferences;
import org.webpki.crypto.KeyStoreSigner;

import org.webpki.json.JSONObjectReader;
import org.webpki.json.JSONObjectWriter;
import org.webpki.json.JSONX509Signer;

public class PaymentRequest implements BaseProperties
  {
    String common_name;
    int amount;
    Currencies currency;
    String reference_id;
    GregorianCalendar date_time;
    
    public PaymentRequest (int amount)
      {
        this.amount = amount;
        this.currency = Currencies.USD;
        this.reference_id = "#" + CheckoutServlet.next_reference_id++;
        this.date_time = new GregorianCalendar ();
        this.common_name = MerchantServlet.COMMON_NAME;
      }

    private PaymentRequest ()
      {
      }

    public JSONObjectWriter serialize () throws IOException
      {
        KeyStoreSigner signer = new KeyStoreSigner (PaymentDemoService.merchant_eecert_key, null);
        signer.setExtendedCertPath (true);
        signer.setKey (null, PaymentDemoService.key_password);
        return new JSONObjectWriter ()
                     .setString (COMMON_NAME_JSON, common_name)
                     .setInt (AMOUNT_JSON, amount)
                     .setString (CURRENCY_JSON, currency.toString ())
                     .setString (REFERENCE_ID_JSON, reference_id)
                     .setDateTime (DATE_TIME_JSON, date_time, true)
                     .setSignature (new JSONX509Signer (signer)
                        .setSignatureCertificateAttributes (true)
                        .setAlgorithmPreferences (AlgorithmPreferences.JOSE));
      }

    public static PaymentRequest parseJSONData (JSONObjectReader payee) throws IOException
      {
        PaymentRequest payment_request = new PaymentRequest ();
        payment_request.common_name = payee.getString (COMMON_NAME_JSON);
        payment_request.amount = payee.getInt (AMOUNT_JSON);
        payment_request.currency = Currencies.valueOf (payee.getString (CURRENCY_JSON));
        payment_request.reference_id = payee.getString (REFERENCE_ID_JSON);
        payment_request.date_time = payee.getDateTime (DATE_TIME_JSON);
        return payment_request;
      }
  }
