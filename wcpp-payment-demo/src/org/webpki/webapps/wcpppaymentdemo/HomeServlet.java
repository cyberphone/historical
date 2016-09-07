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

import javax.servlet.ServletException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class HomeServlet extends HttpServlet
  {
    private static final long serialVersionUID = 1L;
    
    static final String WEB_CRYPTO_ENABLED = "WebCryptoEnabled";
    
    static boolean isWebCryptoEnabled (HttpServletRequest request)
      {
        HttpSession session = request.getSession (false);
        if (session != null)
          {
            Boolean bool = (Boolean) session.getAttribute (WEB_CRYPTO_ENABLED);
            if (bool != null)
              {
                return bool;
              }
          }
        return false;
      }
    
    public void doGet (HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
      {
        if (PaymentDemoService.web_crypto)
          {
            HttpSession session = request.getSession ();
            session.setAttribute (WEB_CRYPTO_ENABLED, new Boolean (cryptoEnabled ()));
          }
        HTML.homePage (cryptoEnabled (), response);
      }

    boolean cryptoEnabled ()
      {
        return false;
      }
  }
