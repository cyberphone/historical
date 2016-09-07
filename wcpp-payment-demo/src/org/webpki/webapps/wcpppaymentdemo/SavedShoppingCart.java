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

import java.io.Serializable;

import java.util.LinkedHashMap;

public class SavedShoppingCart implements Serializable
  {
    private static final long serialVersionUID = 1L;
  
    static final String SAVED_SHOPPING_CART    = "SSD";
  
    int total;
    LinkedHashMap<String, Integer> items = new LinkedHashMap<String, Integer> ();
  }

