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
/*                        JSONArrayReader                         */
/*================================================================*/

org.webpki.json.JSONArrayReader = function (/* JSONValue[] */array)
{
    this.index = 0;
    this.array = array;
};

/* public boolean */org.webpki.json.JSONArrayReader.prototype.hasMore = function ()
{
    return this.index < this.array.length;
};

/* void */org.webpki.json.JSONArrayReader.prototype._inRangeCheck = function ()
{
    if (!this.hasMore ())
    {
        org.webpki.util._error ("Trying to read past of array limit: " + this.index);
    }
};

/* Object */org.webpki.json.JSONArrayReader.prototype._get = function (/* JSONTypes */expected_type)
{
    this._inRangeCheck ();
    /* JSONValue */var value = this.array[this.index++];
    value.read_flag = true;
    org.webpki.json.JSONTypes._compatibilityTest (expected_type, value);
    return value.value;
};

/* public String */org.webpki.json.JSONArrayReader.prototype.getString = function ()
{
    return /* String */this._get (org.webpki.json.JSONTypes.STRING);
};

/* public int */org.webpki.json.JSONArrayReader.prototype.getInt = function ()
{
    return parseInt (/* String */this._get (org.webpki.json.JSONTypes.INTEGER));
};

/* BigInteger */org.webpki.json.JSONArrayReader.prototype.getLong = function ()
{
    return this.getBigInteger ().getLong ();
};

/* public BigInteger */org.webpki.json.JSONArrayReader.prototype.getBigInteger = function ()
{
    return org.webpki.math.BigInteger.fromString (this.getString ());
};

//No real support for BigDecimal but at least text parsing is performed

/* public BigDecimal */org.webpki.json.JSONArrayReader.prototype.getBigDecimal = function ()
{
    return org.webpki.json.JSONObjectReader.parseBigDecimal (this.getString ());
};

/* public Date */org.webpki.json.JSONArrayReader.prototype.getDateTime = function ()
{
    return new Date (this.getString ());
};

/* public double */org.webpki.json.JSONArrayReader.prototype.getDouble = function ()
{
    return parseFloat (this._get (org.webpki.json.JSONTypes.DOUBLE));
};

/* public boolean */org.webpki.json.JSONArrayReader.prototype.getBoolean = function ()
{
    return this._get (org.webpki.json.JSONTypes.BOOLEAN) == "true";
};

/* public boolean */org.webpki.json.JSONArrayReader.prototype.getIfNULL = function ()
{
    if (this.getElementType () == org.webpki.json.JSONTypes.NULL)
    {
        this.scanAway ();
        return true;
    }
    return false;
};
 
/* public JSONArrayReader */org.webpki.json.JSONArrayReader.prototype.getArray = function ()
{
    return new org.webpki.json.JSONArrayReader (/* JSONValue[] */this._get (org.webpki.json.JSONTypes.ARRAY));
};

/* public JSONTypes */org.webpki.json.JSONArrayReader.prototype.getElementType = function ()
{
    this._inRangeCheck ();
    return this.array[this.index].type;
};

/* public JSONObjectReader */org.webpki.json.JSONArrayReader.prototype.getObject = function ()
{
    return new org.webpki.json.JSONObjectReader (/* JSONObject */this._get (org.webpki.json.JSONTypes.OBJECT));
};

/* public void */org.webpki.json.JSONArrayReader.prototype.scanAway = function ()
{
    this._get (this.getElementType ());
};
