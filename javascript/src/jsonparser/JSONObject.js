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
/*                           JSONObject                           */
/*================================================================*/

org.webpki.json.JSONObject = function ()
{
    this.property_list = [];
};

/*void */org.webpki.json.JSONObject._checkObjectForUnread = function (json_object)
{
    for (var i = 0; i < json_object.property_list.length; i++)
    {
        var name = json_object.property_list[i].name;
        var value = json_object.property_list[i].value;
        if (!value.read_flag)
        {
            org.webpki.util._error ('Property "' + name + '" was never read');
        }
        if (value.type == org.webpki.json.JSONTypes.OBJECT)
        {
            org.webpki.json.JSONObject._checkObjectForUnread (value.value);
        }
        else if (value.type == org.webpki.json.JSONTypes.ARRAY)
        {
            org.webpki.json.JSONObject._checkArrayForUnread (value, name);
        }
    }
};

/*void */org.webpki.json.JSONObject._checkArrayForUnread = function (array_holder, name)
{
    var array_list = array_holder.value;
    for (var i = 0; i < array_list.length; i++)
    {
        var json_value = array_list[i];
        if (json_value.type == org.webpki.json.JSONTypes.OBJECT)
        {
            org.webpki.json.JSONObject._checkObjectForUnread (json_value.value);
        }
        else if (json_value.type == org.webpki.json.JSONTypes.ARRAY)
        {
            org.webpki.json.JSONObject._checkArrayForUnread (json_value, name);
        }
        else if (!json_value.read_flag)
        {
            org.webpki.util._error ('Value "' + json_value.value + '" of array "' + name + '" was never read');
        }
    }
};

/* void */org.webpki.json.JSONObject.prototype._setProperty = function (/* String */name, /* JSONValue */value)
{
    if (!(value instanceof org.webpki.json.JSONValue))
    {
        org.webpki.util._error ("Wrong value type: " + value);
    }
    var length = this.property_list.length;
    var new_property = new Object;
    new_property.name = name;
    new_property.value = value;
    for (var i = 0; i < length; i++)
    {
        if (this.property_list[i].name == name)
        {
            // For setupForRewrite
            if (this.property_list[i].value == null)
            {
                length = i;
                break;
            }
            org.webpki.util._error ("Property already defined: " + name);
        }
    }
    this.property_list[length] = new_property;
};

/* JSONValue */org.webpki.json.JSONObject.prototype._getProperty = function (name)
{
    var length = this.property_list.length;
    for (var i = 0; i < length; i++)
    {
        if (this.property_list[i].name == name)
        {
            return this.property_list[i].value;
        }
    }
    return null;
};

/* boolean */org.webpki.json.JSONObject.prototype._isArray = function ()
{
    return this.property_list.length == 1 && !this.property_list[0].name;
};

/* void */org.webpki.json.JSONObject.prototype._setArray = function (/* JSONValue */array)
{
    this.property_list = [];
    var unnamed_property = new Object ();
    unnamed_property.name = null;
    unnamed_property.value = array;
    this.property_list[0] = unnamed_property;
};
