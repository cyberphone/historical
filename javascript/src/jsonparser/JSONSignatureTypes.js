/*
 *  Copyright 2006-2015 WebPKI.org (http://webpki.org).
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

/*================================================================*/
/*                       JSONSignatureTypes                       */
/*================================================================*/

org.webpki.json.JSONSignatureTypes = 
{
    X509_CERTIFICATE:
    {
    },
    ASYMMETRIC_KEY:
    {
    },
    SYMMETRIC_KEY:
    {
    }
};

org.webpki.json.JSONSignatureTypes.getName = function (signature_type)
{
    for (var obj in org.webpki.json.JSONSignatureTypes)
    {
        if (org.webpki.json.JSONSignatureTypes[obj] == signature_type)
        {
            return obj;
        }
    }
    return "UNKNOWN!";
};
