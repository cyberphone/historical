var no_extensions = true;

var disable_signdata = false;

var mySigner = function (signature_type, algorithm)
{
    this._signature_type = signature_type;
    this._algorithm = algorithm;
    if (no_extensions)
    {
        this.getExtensions = null;
    }
    if (disable_signdata)
    {
        this.signData = null;
    }
};

/* String */ mySigner.prototype.getAlgorithm = function ()
{
    return this._algorithm;
};

/* JSONSignatureTypes */mySigner.prototype.getSignatureType = function ()
{
    return this._signature_type;
};

/* Uint8Array */ mySigner.prototype.getPublicKey = function ()
{
    return this._public_key = org.webpki.util.Base64URL.decode ("" + AntCrypto.getPublicKey (this._algorithm));
};

/* Uint8Array[] */ mySigner.prototype.getCertificatePath = function ()
{
    var path = [];
    path[0] = org.webpki.util.Base64URL.decode ("" + AntCrypto.getX509Certificate (this._algorithm));
    return this._x509_certificate_path = path;
};

/* String */ mySigner.prototype.getKeyId = function ()
{
    return this._signature_type == org.webpki.json.JSONSignatureTypes.SYMMETRIC_KEY ? "my.symmetric.key" : null;
};

/* Uint8Array */mySigner.prototype.signData = function (/* Uint8Array */ data)
{
    return org.webpki.util.Base64URL.decode ("" + AntCrypto.signData (org.webpki.util.Base64URL.encode (data), this._algorithm));
};

/* boolean */mySigner.prototype.wantSignatureCertificateAttributes = function ()
{
    return true;
};

var extension_objects = [new org.webpki.json.JSONObjectWriter ()
                             .setString (org.webpki.json.JSONSignatureDecoder.TYPE_JSON, "http://example.com/important")
                             .setInt ("data", 88)];

mySigner.prototype.getExtensions = function ()
{
    return extension_objects;
};

function myVerifier (signer)
{
    this._signer = signer;  // For _testing_purposes_ this is ok, right? :-)
}

/* JSONSignatureTypes */myVerifier.prototype.getVerifierType = function ()
{
    return this._signer._signature_type;
};

/* JSONSignatureTypes */myVerifier.prototype.verify = function (/* JSONSignatureDecoder */signature_decoder)
{
    console.debug (signature_decoder.getSignatureAlgorithm ());
    var signature_key = "";
    if (signature_decoder.getSignatureType () == org.webpki.json.JSONSignatureTypes.SYMMETRIC_KEY)
    {
        if (this._signer.getKeyId () != signature_decoder.getKeyId ())
        {
            throw "Key ID";
        }
    }
    else
    {
        signature_key = org.webpki.util.Base64URL.encode (signature_decoder.getPublicKey ());
//        console.debug (getSignatureAlgorithm ());
//        AntCrypto.verify (signature_decoder.getSignatureAlgorithm ())
    }
    return AntCrypto.verifySignature (org.webpki.util.Base64URL.encode (signature_decoder.getNormalizedData ()),
                                      org.webpki.util.Base64URL.encode (signature_decoder.getSignatureValue ()),
                                      signature_decoder.getSignatureAlgorithm (),
                                      signature_key);
};

function signatureTest (signature_type, algorithm)
{
    disable_signdata = false;
    var signer = new mySigner (signature_type, algorithm);
    var signedDoc = new org.webpki.json.JSONObjectWriter ();
    signedDoc.setString ("Statement", "Hello signed world!");
    signedDoc.setSignature (signer);
    var result = signedDoc.serializeJSONObject (org.webpki.json.JSONOutputFormats.PRETTY_PRINT);
    console.debug (result);
    var document_reader = org.webpki.json.JSONParser.parse (result);
    var decoded_signature = document_reader.getSignature ();
    decoded_signature.verify (new myVerifier (signer));
    if (decoded_signature.getExtensions () == null)
    {
        if (!no_extensions)
        {
            throw "Missing extensions";
        }
    }
    else
    {
        if (no_extensions)
        {
            throw "Unexpected extensions";
        }
        var got = decoded_signature.getExtensions ();
        if (got.length != extension_objects.length)
        {
            throw "Wrong number of extensions";
        }
        for (var i = 0; i < got.length; i++)
        {
            if (new org.webpki.json.JSONObjectWriter (got[i]).serializeJSONObject (org.webpki.json.JSONOutputFormats.NORMALIZED) !=
                extension_objects[i].serializeJSONObject (org.webpki.json.JSONOutputFormats.NORMALIZED))
            {
                throw "Mismatch in extensions";
            }
        }
    }
    if (new org.webpki.json.JSONObjectWriter (document_reader).serializeJSONObject (org.webpki.json.JSONOutputFormats.PRETTY_PRINT)
                                             !=
        result)
    {
        throw "Changed input";
    }
    signer = new mySigner (signature_type, algorithm);
    disable_signdata = true;
    signedDoc = new org.webpki.json.JSONObjectWriter ();
    signedDoc.setString ("Statement", "Hello async signed world!").setString ("SignatureType", org.webpki.json.JSONSignatureTypes.getName (signature_type));
    var data_to_sign = signedDoc.beginSignature (signer);
    var signature_value = org.webpki.util.Base64URL.decode ("" + AntCrypto.signData (org.webpki.util.Base64URL.encode (data_to_sign), algorithm));
    signedDoc.endSignature (signature_value);
    var result = signedDoc.serializeJSONObject (org.webpki.json.JSONOutputFormats.PRETTY_PRINT);
    console.debug (result);
    var document_reader = org.webpki.json.JSONParser.parse (result);
    document_reader.getSignature ().verify (new myVerifier (signer));
}

signatureTest (org.webpki.json.JSONSignatureTypes.ASYMMETRIC_KEY,
               "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256");

signatureTest (org.webpki.json.JSONSignatureTypes.ASYMMETRIC_KEY,
               "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256");

signatureTest (org.webpki.json.JSONSignatureTypes.X509_CERTIFICATE,
               "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256");

signatureTest (org.webpki.json.JSONSignatureTypes.X509_CERTIFICATE,
               "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256");

signatureTest (org.webpki.json.JSONSignatureTypes.SYMMETRIC_KEY,
               "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256");

no_extensions = false;
signatureTest (org.webpki.json.JSONSignatureTypes.ASYMMETRIC_KEY,
               "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256");

console.debug ("Signature tests successful!");
