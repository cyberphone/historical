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
/*                        JSONObjectReader                        */
/*================================================================*/

org.webpki.json.JSONObjectReader = function (/* JSONObject */root)
{
    this.root = root;
};

org.webpki.json.JSONObjectReader.DECIMAL_PATTERN = new RegExp ("^(-?([1-9][0-9]+|0)[\\.][0-9]+)$");

/* void */org.webpki.json.JSONObjectReader.prototype.checkForUnread = function ()
{
    if (this.root._isArray())
    {
        org.webpki.json.JSONObject._checkArrayForUnread (this.root.property_list[0].value, "Outer");
    }
    else
    {
        org.webpki.json.JSONObject._checkObjectForUnread (this.root);
    }
};

/* JSONValue */org.webpki.json.JSONObjectReader.prototype._getPropertyEntry = function (/* String */name)
{
    /* JSONValue */var value = this.root._getProperty (name);
    if (value == null)
    {
        org.webpki.util._error ("Property \"" + name + "\" is missing");
    }
    return value;
};

/* JSONValue */org.webpki.json.JSONObjectReader.prototype._getProperty = function (/* String */name, /* JSONTypes */expected_type)
{
    /* JSONValue */var value = this._getPropertyEntry (name);
    org.webpki.json.JSONTypes._compatibilityTest (expected_type, value);
    value.read_flag = true;
    return value;
};

/* String */org.webpki.json.JSONObjectReader.prototype._getString = function (/* String */name, /* JSONTypes */expected)
{
    /* JSONValue */var value = this._getProperty (name, expected);
    return /* String */value.value;
};

/* public String */org.webpki.json.JSONObjectReader.prototype.getString = function (/* String */name)
{
    return this._getString (name, org.webpki.json.JSONTypes.STRING);
};

/* public int */org.webpki.json.JSONObjectReader.prototype.getInt = function (/* String */name)
{
    return parseInt (this._getString (name, org.webpki.json.JSONTypes.INTEGER));
};

/* public BigInteger */org.webpki.json.JSONObjectReader.prototype.getLong = function (/* String */name)
{
    return this.getBigInteger (name).getLong ();
};

/* public boolean */org.webpki.json.JSONObjectReader.prototype.getBoolean = function (/* String */name)
{
    return this._getString (name, org.webpki.json.JSONTypes.BOOLEAN) == "true";
};

/* public Date */org.webpki.json.JSONObjectReader.prototype.getDateTime = function (/* String */name)
{
    return new Date (this.getString (name));
};

/* Uint8Array */org.webpki.json.JSONObjectReader.prototype.getBinary = function (/* String */name)
{
    return org.webpki.util.Base64URL.decode (this.getString (name));
};

/* public BigInteger */org.webpki.json.JSONObjectReader.prototype.getBigInteger = function (/* String */name)
{
    return org.webpki.math.BigInteger.fromString (this.getString (name));
};

/* String */org.webpki.json.JSONObjectReader.parseBigDecimal = function (/* String */value)
{
    if (org.webpki.json.JSONParser.INTEGER_PATTERN.test (value) ||
        org.webpki.json.JSONObjectReader.DECIMAL_PATTERN.test (value))
    {
       return value;
    }
    org.webpki.util._error ("Malformed \"BigDecimal\": " + value);
};

// No real support for BigDecimal but at least text parsing is performed

/* public BigDecimal */org.webpki.json.JSONObjectReader.prototype.getBigDecimal = function (/* String */name)
{
    return org.webpki.json.JSONObjectReader.parseBigDecimal (this.getString (name));
};


/* public double */org.webpki.json.JSONObjectReader.prototype.getDouble = function (/* String */name)
{
    return parseFloat (this._getString (name, org.webpki.json.JSONTypes.DOUBLE));
};

/* public JSONArrayReader */org.webpki.json.JSONObjectReader.prototype.getJSONArrayReader = function ()
{
    return this.root._isArray () ?  new org.webpki.json.JSONArrayReader (/* JSONValue[] */this.root.property_list[0].value.value) : null;
};

/* public boolean */org.webpki.json.JSONObjectReader.prototype.getIfNULL = function (/* String */name)
{
    if (this.getPropertyType (name) == org.webpki.json.JSONTypes.NULL)
    {
        this.scanAway (name);
        return true;
    }
    return false;
};

/* public JSONObjectReader */org.webpki.json.JSONObjectReader.prototype.getObject = function (/* String */name)
{
    /* JSONValue */var value = this._getProperty (name, org.webpki.json.JSONTypes.OBJECT);
    return new org.webpki.json.JSONObjectReader (/* JSONObject */value.value);
};

/* public JSONArrayReader */org.webpki.json.JSONObjectReader.prototype.getArray = function (/* String */name)
{
    /* JSONValue */var value = this._getProperty (name, org.webpki.json.JSONTypes.ARRAY);
    return new org.webpki.json.JSONArrayReader (/* JSONValue[] */value.value);
};

/* public String */org.webpki.json.JSONObjectReader.prototype.getStringConditional = function (/* String */name, /* String */optional_default_value)
{
    if (this.hasProperty (name))
    {
        return this.getString (name);
    }
    return optional_default_value === undefined ? null : optional_default_value;
};
 
/* public boolean */org.webpki.json.JSONObjectReader.prototype.getBooleanConditional = function (/* String */name, /* boolean */optional_default_value)
{
    if (hasProperty (name))
    {
        return getBoolean (name);
    }
    return optional_default_value === undefined ? false : optional_default_value;
};

/* Uint8Array */org.webpki.json.JSONObjectReader.prototype.getBinaryConditional = function (/* String */name)
{
    return this.hasProperty (name) ? this.getBinary (name) : null;
};

/* public String[] */org.webpki.json.JSONObjectReader.prototype.getStringArrayConditional = function (/* String */name)
{
    return this.hasProperty (name) ? this.getStringArray (name) : null;
};

/* String [] */org.webpki.json.JSONObjectReader.prototype._getSimpleArray = function (/* String */name, /* JSONTypes */expected_type)
{
    /* String[] */var array = [];
    /* JSONValue */var value = this._getProperty (name, org.webpki.json.JSONTypes.ARRAY);
    var in_arr = /* JSONValue[] */value.value;
    for (var i = 0; i < in_arr.length; i++)
    {
        org.webpki.json.JSONTypes._compatibilityTest (expected_type, in_arr[i]);
        array[i] = in_arr[i].value;
        in_arr[i].read_flag = true;
    }
    return array;
};

/* public String[] */org.webpki.json.JSONObjectReader.prototype.getStringArray = function (/* String */name)
{
    return this._getSimpleArray (name, org.webpki.json.JSONTypes.STRING);
};
 
 /* public Unit8Array[] */org.webpki.json.JSONObjectReader.prototype.getBinaryArray = function (/* String */name)
{
    /* Unit8Array[] */var blobs = [];
    var in_arr = this.getStringArray (name);
    for (var i = 0; i < in_arr.length; i++)
    {
        blobs[i] = org.webpki.util.Base64URL.decode (in_arr[i]);
    }
     return blobs;
};

/* public String[] */org.webpki.json.JSONObjectReader.prototype.getProperties = function ()
{
    var properties = [];
    for (var i = 0; i < this.root.property_list.length; i++)
    {
        properties[i] = this.root.property_list[i].name;
    }
    return properties;
};

/* public boolean */org.webpki.json.JSONObjectReader.prototype.hasProperty = function (/* String */name)
{
    return this.root._getProperty (name) != null;
};
 
/* public JSONTypes */org.webpki.json.JSONObjectReader.prototype.getPropertyType = function (/* String */name)
{
    /* JSONValue */var value = this.root._getProperty (name);
    return value == null ? null : value.type;
};

/**
 * Read and decode JCS signature object from the current JSON object.
 * Returns a object which can be used to verify keys etc.
 */
/* public JSONSignatureDecoder */org.webpki.json.JSONObjectReader.prototype.getSignature = function ()
{
    return new org.webpki.json.JSONSignatureDecoder (this);
};

/* public PublicKey/Uint8Array */org.webpki.json.JSONObjectReader.prototype.getPublicKey = function ()
{
    return org.webpki.json.JSONSignatureDecoder._getPublicKey (this);
};

/* public X509Certificate[]/Uint8Array[] */org.webpki.json.JSONObjectReader.prototype.getCertificatePath = function ()
{
    return org.webpki.json.JSONSignatureDecoder._getCertificatePath (this);
};

/* public void */org.webpki.json.JSONObjectReader.prototype.scanAway = function (/* String */name)
{
    this._getProperty (name, this.getPropertyType (name));
};

/* String */org.webpki.json.JSONObjectReader.prototype.serializeJSONObject = function (/* JSONOutputFormats */output_format)
{
    return new org.webpki.json.JSONObjectWriter (this.root).serializeJSONObject (output_format);
};

/* public JSONObjectReader */org.webpki.json.JSONObjectReader.prototype.clone = function ()
{
    return org.webpki.json.JSONParser.parse (this.serializeJSONObject (org.webpki.json.JSONOutputFormats.NORMALIZED));
};

/* public JSONObjectReader */org.webpki.json.JSONObjectReader.prototype.removeProperty = function (/* String */name)
{
    this._getPropertyEntry (name);
    var original = this.root.property_list;
    var new_list = [];
    for (var i = 0; i < original.length; i++)
    {
        if (original[i].name != name)
        {
            new_list.push (original[i]);
        }
    }
    this.root.property_list = new_list;
    return this;
};
