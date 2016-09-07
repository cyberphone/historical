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

public enum Currencies
  {
    USD ("$\\u200a",       true), 
    EUR ("\\u200a\\u20ac", false),
    GBP ("\\u00a3\\u200a", true);
    
    String symbol;
    boolean first_position;
    
    Currencies (String symbol, boolean first_position)
      {
        this.symbol = symbol;
        this.first_position = first_position;
      }
  }
