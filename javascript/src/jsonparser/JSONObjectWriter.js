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
/*                        JSONObjectWriter                        */
/*================================================================*/

org.webpki.json.JSONObjectWriter = function (/* optional argument */optional_object_or_reader)
{
    /* int */this.STANDARD_INDENT = 2;

    /* JSONObject */this.root = null;

    /* String */this.buffer = null;
    
    /* int */this.indent = 0;
    
    /* boolean */this.pretty_print = true;

    /* boolean */this.java_script_string = false;

    /* boolean */this.html_mode = false;
    
    /* int */this.indent_factor = 0;

    /* boolean */this.jose_algorithm_preference = false;
    
    /* static String */this.html_variable_color = "#008000";
    /* static String */this.html_string_color   = "#0000C0";
    /* static String */this.html_property_color = "#C00000";
    /* static String */this.html_keyword_color  = "#606060";
    /* static int */this.html_indent = 4;

    if (optional_object_or_reader === undefined)
    {
        this.root = new org.webpki.json.JSONObject ();
    }
    else if (optional_object_or_reader instanceof org.webpki.json.JSONObject)
    {
        this.root = optional_object_or_reader;
    }
    else if (optional_object_or_reader instanceof org.webpki.json.JSONObjectReader)
    {
        this.root = optional_object_or_reader.root;
        if (this.root._isArray ())
        {
            org.webpki.util._error ("You cannot update array objects");
        }
    }
    else
    {
        org.webpki.util._error ("Wrong init of org.webpki.json.JSONObjectWriter");
    }
};

/* JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype._setProperty = function (/* String */name, /* JSONValue */value)
{
    this.root._setProperty (name, value);
    return this;
};

/* public void */org.webpki.json.JSONObjectWriter.prototype.setupForRewrite = function (/* String */name)
{
    for (var i = 0; i < this.root.property_list.length; i++)
    {
        if (this.root.property_list[i].name == name)
        {
            this.root.property_list[i].value = null;
            return;
        }
    }
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setString = function (/* String */name, /* String */value)
{
    if (typeof value != "string")
    {
        org.webpki.util._error ("Bad string: " + name);
    }
    return this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.STRING, value));
};

/* String */org.webpki.json.JSONObjectWriter._intTest = function (/* int */value)
{
    var int_string = value.toString ();
    if (typeof value != "number" || int_string.indexOf ('.') >= 0)
    {
        org.webpki.util._error ("Bad integer: " + int_string);
    }
    return int_string;
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setInt = function (/* String */name, /* int */value)
{
    return this._setProperty (name,
                              new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.INTEGER,
                                                             org.webpki.json.JSONObjectWriter._intTest (value)));
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setLong = function (/* String */name, /* BigInteger */value)
{
    return this.setBigInteger (name, value.getLong ());
};

/* String */org.webpki.json.JSONObjectWriter._doubleTest = function (/* double */value)
{
    if (typeof value != "number")
    {
        org.webpki.util._error ("Bad float type " + (typeof value));
    }
    return value.toString ();
};

/* String */org.webpki.json.JSONObjectWriter._boolTest = function (/* boolean */value)
{
    if (typeof value != "boolean")
    {
        org.webpki.util._error ("Bad bool type " + (typeof value));
    }
    return value.toString ();
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setDouble = function (/* String */name, /* double */value)
{
    return this._setProperty (name, 
                              new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.DOUBLE, 
                                                             org.webpki.json.JSONObjectWriter._doubleTest (value)));
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setBigInteger = function (/* String */name, /* BigInteger */value)
{
    return this.setString (name, value.toString ());
};

// No real support for BigDecimal but at least text parsing is performed

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setBigDecimal = function (/* String */name, /* BigDecimal */value)
{
    return this.setString (name, org.webpki.json.JSONObjectReader.parseBigDecimal (value));
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setBoolean = function (/* String */name, /* boolean */value)
{
    return this._setProperty (name, 
                              new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.BOOLEAN,
                                                             org.webpki.json.JSONObjectWriter._boolTest (value)));
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setNULL = function (/* String */name)
{
    return this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.NULL, "null"));
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setDateTime = function (/* String */name, /* Date */date_time)
{
    return this.setString (name, date_time.toISOString ());
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setBinary = function (/* String */name, /* Uint8Array */ value) 
{
    return this.setString (name, org.webpki.util.Base64URL.encode (value));
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setObject = function (/*String */name, optional_reader_or_writer)
{
    if (optional_reader_or_writer === undefined)
    {
        var writer = new org.webpki.json.JSONObjectWriter ();
        this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.OBJECT, writer.root));
        return writer;
    }
    if (optional_reader_or_writer instanceof org.webpki.json.JSONObjectReader ||
        optional_reader_or_writer instanceof org.webpki.json.JSONObjectWriter)
    {
        return this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.OBJECT, optional_reader_or_writer.root));
    }
    org.webpki.util._error ("Unknown argument");
};

/* public JSONArrayWriter */org.webpki.json.JSONObjectWriter.prototype.setArray = function (/* String */name, /* JSONArrayWriter*/ optional_writer)
{
    if (optional_writer === undefined)
    {
        var writer = new org.webpki.json.JSONArrayWriter ();
        this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.ARRAY, writer.array));
        return writer;
    }
    if (optional_writer instanceof org.webpki.json.JSONArrayWriter)
    {
        return this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.ARRAY, optional_writer.array));
    }
    org.webpki.util._error ("JSONArrayWriter expected");
};

/* JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype._setStringArray = function (/* String */name, /* String[] */values, /* JSONTypes */json_type)
{
    /* JSONValue[] */var array = [];
    for (var i = 0; i < values.length; i++)
    {
        array[i] = new org.webpki.json.JSONValue (json_type, values[i]);
    }
    return this._setProperty (name, new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.ARRAY, array));
};

/* JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setBinaryArray = function (/* String */name, /* Uint8Array[] */values)
{
    /* String[] */var array = [];
    for (var i = 0; i < values.length; i++)
    {
        array.push (org.webpki.util.Base64URL.encode (values[i]));
    }
    return this.setStringArray (name, array);
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setStringArray = function (/* String */name, /* String[] */values)
{
    return this._setStringArray (name, values, org.webpki.json.JSONTypes.STRING);
};

org.webpki.json.JSONObjectWriter.prototype._setCryptoBinary = function (/* Uint8Array */value,  /* String */name)
{
    while (value.length > 1 && value[0] == 0x00)  // Could some EC parameters actually need more than one turn?
    {
        value = new Uint8Array (value.subarray (1));
    }
    this.setBinary (name, value);
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setSignature = function (/* JSONSigner */signer)
{
    return this.endSignature (signer.signData (this.beginSignature (signer)));
};

/* public Uint8Array */org.webpki.json.JSONObjectWriter.prototype.beginSignature = function (/* JSONSigner */signer)
{
    this.signature_writer = this.setObject (org.webpki.json.JSONSignatureDecoder.SIGNATURE_JSON);
    this.signature_writer.setString (org.webpki.json.JSONSignatureDecoder.ALGORITHM_JSON, signer.getAlgorithm ());
    if (signer.getKeyId ())
    {
        this.signature_writer.setString (org.webpki.json.JSONSignatureDecoder.KEY_ID_JSON, signer.getKeyId ());
    }
    switch (signer.getSignatureType ())
    {
        case org.webpki.json.JSONSignatureTypes.ASYMMETRIC_KEY:
             this.signature_writer.setPublicKey (signer.getPublicKey ());
             break;

        case org.webpki.json.JSONSignatureTypes.SYMMETRIC_KEY:
             break;

        case org.webpki.json.JSONSignatureTypes.X509_CERTIFICATE:
            var certificate_path = signer.getCertificatePath ();
            if (signer.wantSignatureCertificateAttributes != null && signer.wantSignatureCertificateAttributes ())
            {
                var signature_certificate = new org.webpki.crypto.X509CertificateDecoder (certificate_path[0]);
                if (signature_certificate.issuer != null && signature_certificate.subject != null)
                {
                    var signature_certificate_info_writer = this.signature_writer.setObject (org.webpki.json.JSONSignatureDecoder.SIGNER_CERTIFICATE_JSON);
                    signature_certificate_info_writer.setString (org.webpki.json.JSONSignatureDecoder.ISSUER_JSON, signature_certificate.issuer);
                    signature_certificate_info_writer.setBigInteger (org.webpki.json.JSONSignatureDecoder.SERIAL_NUMBER_JSON, signature_certificate.serial_number);
                    signature_certificate_info_writer.setString (org.webpki.json.JSONSignatureDecoder.SUBJECT_JSON, signature_certificate.subject);
                }
            }
            this.signature_writer.setCertificatePath (certificate_path);
            break;

        default:
            org.webpki.util._error ("Unknown signature type requested");
     }
    if (signer.getExtensions != null)
    {
        var array = /* new JSONValue */[];
        var extensions = signer.getExtensions ();
        for (var i = 0; i < extensions.length; i++)
        {
            array.push (new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.OBJECT, extensions[i].root));
        }
        this.signature_writer._setProperty (org.webpki.json.JSONSignatureDecoder.EXTENSIONS_JSON,
                                            new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.ARRAY, array));
    }
    return this.getNormalizedUTF8Representation ();
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.endSignature = function (/* Uni8Array */signature_value)
{
    this.signature_writer.setBinary (org.webpki.json.JSONSignatureDecoder.VALUE_JSON, signature_value);
    return this;
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setPublicKey = function (/* Uint8Array */public_key_in_x509_format)
{
    /* JSONObjectWriter */var public_key_writer = this.setObject (org.webpki.json.JSONSignatureDecoder.PUBLIC_KEY_JSON);
    var key_alg = new org.webpki.crypto.PublicKeyDecoder (public_key_in_x509_format);
    if (key_alg.rsa_flag)
    {
        public_key_writer.setString (org.webpki.json.JSONSignatureDecoder.TYPE_JSON, org.webpki.json.JSONSignatureDecoder.RSA_PUBLIC_KEY);
        public_key_writer._setCryptoBinary (key_alg.modulus, org.webpki.json.JSONSignatureDecoder.N_JSON);
        public_key_writer._setCryptoBinary (key_alg.exponent, org.webpki.json.JSONSignatureDecoder.E_JSON);
    }
    else
    {
        public_key_writer.setString (org.webpki.json.JSONSignatureDecoder.TYPE_JSON, org.webpki.json.JSONSignatureDecoder.EC_PUBLIC_KEY);
        public_key_writer.setString (org.webpki.json.JSONSignatureDecoder.CURVE_JSON, 
                                     (this.jose_algorithm_preference && key_alg.josename) ?
                                                                         key_alg.josename : key_alg.uri);
        public_key_writer.setBinary (org.webpki.json.JSONSignatureDecoder.X_JSON, key_alg.x);
        public_key_writer.setBinary (org.webpki.json.JSONSignatureDecoder.Y_JSON, key_alg.y);
    }
    return this;
};

/* JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setJOSEAlgorithmPreference = function (/* boolean */flag)
{
    this.jose_algorithm_preference = flag;
    return this;
};

/* public JSONObjectWriter */org.webpki.json.JSONObjectWriter.prototype.setCertificatePath = function (/* X509Certificate[] */certificate_path)
{
/*
     X509Certificate last_certificate = null;
        Vector<byte[]> certificates = new Vector<byte[]> ();
        for (X509Certificate certificate : certificate_path)
          {
            try
              {
                certificates.add (JSONSignatureDecoder.pathCheck (last_certificate, last_certificate = certificate).getEncoded ());
              }
            catch (GeneralSecurityException e)
              {
                throw new IOException (e);
              }
          }
*/
    var certificates = certificate_path;  // Note: the above is still missing...
    this.setBinaryArray (org.webpki.json.JSONSignatureDecoder.CERTIFICATE_PATH_JSON, certificates);
    return this;
};

/* void */org.webpki.json.JSONObjectWriter.prototype._beginObject = function (/* boolean */array_flag)
{
    this._indentLine ();
    this._spaceOut ();
    if (array_flag)
    {
        this.indent++;
        this.buffer += '[';
    }
    this.buffer += '{';
    this._indentLine ();
};

/* void */org.webpki.json.JSONObjectWriter.prototype._newLine = function ()
{
    if (this.pretty_print)
    {
        this.buffer += this.html_mode ? "<br>" : "\n";
    }
};

/* void */org.webpki.json.JSONObjectWriter.prototype._indentLine = function ()
{
    this.indent += this.indent_factor;
};

/* void */org.webpki.json.JSONObjectWriter.prototype._undentLine = function ()
{
    this.indent -= this.indent_factor;
};

/* void */org.webpki.json.JSONObjectWriter.prototype._endObject = function ()
{
    this._newLine ();
    this._undentLine ();
    this._spaceOut ();
    this._undentLine ();
    this.buffer += '}';
};

/* void */org.webpki.json.JSONObjectWriter.prototype._printOneElement = function (/* JSONValue */json_value)
{
    switch (json_value.type)
    {
        case org.webpki.json.JSONTypes.ARRAY:
            this._printArray (/* JSONValue[] */json_value.value, false);
            break;
    
        case org.webpki.json.JSONTypes.OBJECT:
            this._newLine ();
            this._printObject (/* JSONObject */json_value.value, false);
            break;
    
        default:
            this._printSimpleValue (json_value, false);
    }
};

/* void */org.webpki.json.JSONObjectWriter.prototype._printObject = function (/* JSONObject */object, /* boolean */array_flag)
{
    this._beginObject (array_flag);
    /* boolean */var next = false;
    var length = object.property_list.length;
    for (var i = 0; i < length; i++)
    {
        /* JSONValue */var json_value = object.property_list[i].value;
        /* String */var property = object.property_list[i].name;
        if (next)
        {
            this.buffer += ',';
        }
        this._newLine ();
        next = true;
        this._printProperty (property);
        this._printOneElement (json_value);
    }
    this._endObject ();
};
  
/* void */org.webpki.json.JSONObjectWriter.prototype._printArray = function (/* JSONValue[] */array, /* boolean */array_flag)
{
    if (array.length == 0)
    {
        this.buffer += '[';
    }
    else
    {
        /* boolean */var mixed = false;
        /* JSONTypes */var first_type = array[0].type;
        for (var i = 0; i < array.length; i++)
        {
            var json_value = array[i];
            if (first_type.complex != json_value.type.complex ||
                    (first_type.complex && first_type != json_value.type))

            {
                mixed = true;
                break;
            }
        }
        if (mixed)
        {
            this.buffer += '[';
            /* boolean */var next = false;
            for (var i = 0; i < array.length; i++)
            {
                var json_value = array[i];
                if (next)
                {
                    this.buffer += ',';
                }
                else
                {
                    next = true;
                }
                this._printOneElement (json_value);
            }
        }
        else if (first_type == org.webpki.json.JSONTypes.OBJECT)
        {
            this._printArrayObjects (array);
        }
        else if (first_type == org.webpki.json.JSONTypes.ARRAY)
        {
            this._newLine ();
            this._indentLine ();
            this._spaceOut ();
            this.buffer += '[';
            /* boolean */var next = false;
            for (var i = 0; i < array.length; i++)
            {
                var json_value = array[i];
                /* JSONValue[] */var sub_array = json_value.value;
                /* boolean */var extra_pretty = sub_array.length == 0 || !sub_array[0].type.complex;
                if (next)
                {
                    this.buffer += ',';
                }
                else
                {
                    next = true;
                }
                if (extra_pretty)
                {
                    this._newLine ();
                    this._indentLine ();
                    this._spaceOut ();
                }
                this._printArray (sub_array, true);
                if (extra_pretty)
                {
                    this._undentLine ();
                }
            }
            this._newLine ();
            this._spaceOut ();
            this._undentLine ();
        }
        else
        {
            this._printArraySimple (array, array_flag);
        }
    }
    this.buffer += ']';
};

/* void */org.webpki.json.JSONObjectWriter.prototype._printArraySimple = function (/* JSONValue[] */array, /* boolean */array_flag)
{
    /* int */var length = 0;
    for (var i = 0; i < array.length; i++)
    {
        length += array[i].value.length;
    }
    /* boolean */var broken_lines = length > 100;
    /* boolean */var next = false;
    if (broken_lines && !array_flag)
    {
        this._indentLine ();
        this._newLine ();
        this._spaceOut ();
    }
    this.buffer += '[';
    if (broken_lines)
    {
        this._indentLine ();
        this._newLine ();
    }
    for (var i = 0; i < array.length; i++)
    {
        if (next)
        {
            this.buffer += ',';
            if (broken_lines)
            {
                this._newLine ();
            }
        }
        if (broken_lines)
        {
            this._spaceOut ();
        }
        this._printSimpleValue (array[i], false);
        next = true;
    }
    if (broken_lines)
    {
        this._undentLine ();
        this._newLine ();
        this._spaceOut ();
        if (!array_flag)
        {
            this._undentLine ();
        }
    }
};

/* void */org.webpki.json.JSONObjectWriter.prototype._printArrayObjects = function (/* JSONValue[] */array)
{
    /* boolean */var next = false;
    for (var i = 0; i < array.length; i++)
    {
        if (next)
        {
            this.buffer += ',';
        }
        this._newLine ();
        this._printObject (array[i].value, !next);
        next = true;
    }
    this.indent--;
};

/* void */org.webpki.json.JSONObjectWriter.prototype._printSimpleValue = function (/* JSONValue */value, /* boolean */property)
{
    /* String */var string = value.value;
    if (value.type != org.webpki.json.JSONTypes.STRING)
    {
        if (this.html_mode)
        {
            this.buffer += "<span style=\"color:" + this.html_variable_color + "\">";
        }
        this.buffer += string;
        if (this.html_mode)
        {
            this.buffer += "</span>";
        }
        return;
    }
    if (this.html_mode)
    {
        this.buffer += "&quot;<span style=\"color:" +
                            (property ?
                                    (string.indexOf ('@') == 0) ?
                                        this.html_keyword_color : this.html_property_color
                                      : this.html_string_color) +
                        "\">";
    }
    else
    {
        this.buffer += '"';
    }
    for (var i = 0; i < string.length; i++)
    {
        var c = string.charAt (i);
        if (this.html_mode)
        {
            switch (c)
            {
                //
                //      HTML needs specific escapes...
                //
                case '<':
                    this.buffer += "&lt;";
                    continue;
    
                case '>':
                    this.buffer += "&gt;";
                    continue;
    
                case '&':
                    this.buffer += "&amp;";
                    continue;
    
                case '"':
                    this.buffer += "\\&quot;";
                    continue;
            }
        }

        switch (c)
        {
            case '\\':
                if (this.java_script_string)
                {
                    // JS escaping need \\\\ in order to produce a JSON \\
                    this.buffer += '\\';
                }
    
            case '"':
                this._escapeCharacter (c);
                break;
    
            case '\b':
                this._escapeCharacter ('b');
                break;
    
            case '\f':
                this._escapeCharacter ('f');
                break;
    
            case '\n':
                this._escapeCharacter ('n');
                break;
    
            case '\r':
                this._escapeCharacter ('r');
                break;
    
            case '\t':
                this._escapeCharacter ('t');
                break;
    
            case '\'':
                if (this.java_script_string)
                {
                    // Since we assumed that the JSON object was enclosed between '' we need to escape ' as well
                    this.buffer += '\\';
                }
    
            default:
                var utf_value = c.charCodeAt (0);
                if (utf_value < 0x20)
                {
                    this._escapeCharacter ('u');
                    this.buffer += org.webpki.util.HEX.fourHex (utf_value);
                    break;
                }
                this.buffer += c;
        }
    }
    if (this.html_mode)
    {
        this.buffer += "</span>&quot;";
    }
    else
    {
        this.buffer += '"';
    }
};

/* void */org.webpki.json.JSONObjectWriter.prototype._escapeCharacter = function (/* char */c)
{
    if (this.java_script_string)
    {
        this.buffer += '\\';
    }
    this.buffer += '\\' + c;
};

/* void */org.webpki.json.JSONObjectWriter.prototype._singleSpace = function ()
{
    if (this.pretty_print)
    {
        if (this.html_mode)
        {
            this.buffer += "&nbsp;";
        }
        else
        {
            this.buffer += ' ';
        }
    }
};

/* void */org.webpki.json.JSONObjectWriter.prototype._printProperty = function (/* String */name)
{
    this._spaceOut ();
    this._printSimpleValue (new org.webpki.json.JSONValue (org.webpki.json.JSONTypes.STRING, name), true);
    this.buffer += ':';
    this._singleSpace ();
};

/* void */org.webpki.json.JSONObjectWriter.prototype._spaceOut = function ()
{
    for (var i = 0; i < this.indent; i++)
    {
        this._singleSpace ();
    }
};

/* Uint8Array */org.webpki.json.JSONObjectWriter.prototype.getNormalizedUTF8Representation = function ()
{
    return org.webpki.util.ByteArray.convertStringToUTF8 (this.serializeJSONObject (org.webpki.json.JSONOutputFormats.NORMALIZED));
};

/* String */org.webpki.json.JSONObjectWriter.prototype.serializeJSONObject = function (/* JSONOutputFormats */output_format)
{
    this.buffer = new String ();
    this.indent_factor = output_format == org.webpki.json.JSONOutputFormats.PRETTY_HTML ? this.html_indent : this.STANDARD_INDENT;
    this.indent = -this.indent_factor;
    this.pretty_print = output_format == org.webpki.json.JSONOutputFormats.PRETTY_HTML || output_format == org.webpki.json.JSONOutputFormats.PRETTY_PRINT;
    this.java_script_string = output_format == org.webpki.json.JSONOutputFormats.JAVASCRIPT_STRING;
    this.html_mode = output_format == org.webpki.json.JSONOutputFormats.PRETTY_HTML;
    if (this.java_script_string)
    {
        this.buffer += '\'';
    }
    if (this.root._isArray ())
    {
        this._printArray (/* JSONValue[] */this.root.property_list[0].value.value, false);
    }
    else
    {
        this._printObject (this.root, false);
    }
    if (output_format == org.webpki.json.JSONOutputFormats.PRETTY_PRINT)
    {
        this._newLine ();
    }
    else if (this.java_script_string)
    {
        this.buffer += '\'';
    }
    return this.buffer;
};
