import React, { useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const DisplaySettings = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user, unRead } = useSelector((state) => state.auth);
  // useEffect(() => {
  //   // Load the Google Translate script
  //   const addGoogleTranslateScript = () => {
  //     const script = document.createElement("script");
  //     script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  //     script.async = true;
  //     document.body.appendChild(script);

  //     window.googleTranslateElementInit = () => {
  //       new window.google.translate.TranslateElement(
  //         { pageLanguage: "en" },
  //         "google_translate_element"
  //       );
  //     };
  //   };

  //   addGoogleTranslateScript();
  // }, []);

  const handleLanguageChange = async (event) => {
    const selectedLang = event.target.value;

    const response = await axios.patch(`${baseUrl}/api/auth/language`, { language: selectedLang}, {
      // {...formData, ...uploadData}, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    toast.success(response.data.message)

    // Change the HTML `lang` attribute
    document.documentElement.lang = selectedLang;

    // Trigger Google Translate widget for the selected language
    const iframe = document.querySelector("div.goog-te-gadget");
    if (iframe) {
      const innerDoc = iframe; //iframe.contentDocument || iframe.contentWindow.document;
      const selectBox = innerDoc.querySelector("select");
      if (selectBox) {
        selectBox.value = selectedLang;
        selectBox.dispatchEvent(new Event("change"));
      }
    }
  };

  return (
    <div className="w-full font-montserrat">
      <h2 className="text-2xl font-bold mt-6 pl-6">Account</h2>
      <p className="text-sm font-bold pl-6 mb-6">Customize your view</p>
      <div className="space-y-16">
        <div className="">
          <div className="border-b border-gray-500 pl-6 py-4">
            <p className="text-xl font-semibold">Language</p>
            {/* <p className="text-lg">English</p> */}
            <select
              className="text-lg"
              onChange={handleLanguageChange}
              defaultValue={user.personal_info.language}
            >
              {/* <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option> */}
              <option value="fr">Français</option>
              <option value="ab">Abkhaze</option>
              <option value="ace">Aceh</option>
              <option value="ach">Acholi</option>
              <option value="aa">Afar</option>
              <option value="af">Afrikaans</option>
              <option value="sq">Albanais</option>
              <option value="de">Allemand</option>
              <option value="alz">Alur</option>
              <option value="am">Amharique</option>
              <option value="en">Anglais</option>
              <option value="ar">Arabe</option>
              <option value="hy">Arménien</option>
              <option value="as">Assamais</option>
              <option value="av">Avar</option>
              <option value="awa">Awadhi</option>
              <option value="ay">Aymara</option>
              <option value="az">Azéri</option>
              <option value="ba">Bachkir</option>
              <option value="ban">Balinais</option>
              <option value="bal">Baloutchi</option>
              <option value="bm">Bambara</option>
              <option value="bci">Baoulé</option>
              <option value="eu">Basque</option>
              <option value="btx">Batak Karo</option>
              <option value="bts">Batak Simalungun</option>
              <option value="bbc">Batak Toba</option>
              <option value="bem">Bemba</option>
              <option value="bn">Bengali</option>
              <option value="bew">Betawi</option>
              <option value="bho">Bhodjpouri</option>
              <option value="bik">Bicol</option>
              <option value="be">Biélorusse</option>
              <option value="my">Birman</option>
              <option value="bs">Bosniaque</option>
              <option value="bua">Bouriate</option>
              <option value="br">Breton</option>
              <option value="bg">Bulgare</option>
              <option value="yue">Cantonais</option>
              <option value="ca">Catalan</option>
              <option value="ceb">Cebuano</option>
              <option value="ch">Chamorro</option>
              <option value="ny">Chichewa</option>
              <option value="zh-CN">Chinois (simplifié)</option>
              <option value="zh-TW">Chinois (traditionnel)</option>
              <option value="chk">Chuuk</option>
              <option value="si">Cinghalais</option>
              <option value="ko">Coréen</option>
              <option value="co">Corse</option>
              <option value="ht">Créole haïtien</option>
              <option value="mfe">Créole mauricien</option>
              <option value="crs">Créole seychellois</option>
              <option value="hr">Croate</option>
              <option value="da">Danois</option>
              <option value="fa-AF">Dari</option>
              <option value="din">Dinka</option>
              <option value="dyu">Dioula</option>
              <option value="dv">Divéhi</option>
              <option value="doi">Dogri</option>
              <option value="dov">Dombe</option>
              <option value="dz">Dzongkha</option>
              <option value="es">Espagnol</option>
              <option value="eo">Espéranto</option>
              <option value="et">Estonien</option>
              <option value="ee">Ewe</option>
              <option value="fo">Féroïen</option>
              <option value="fj">Fidjien</option>
              <option value="fi">Finnois</option>
              <option value="fon">Fon</option>
              <option value="fr-CA">Français (Canada)</option>
              <option value="fur">Frioulan</option>
              <option value="fy">Frison</option>
              <option value="gaa">Ga</option>
              <option value="gd">Gaélique (Écosse)</option>
              <option value="gl">Galicien</option>
              <option value="cy">Gallois</option>
              <option value="ka">Géorgien</option>
              <option value="el">Grec</option>
              <option value="gn">Guarani</option>
              <option value="gu">Gujarati</option>
              <option value="cnh">Hakha Chin</option>
              <option value="ha">Haoussa</option>
              <option value="haw">Hawaïen</option>
              <option value="iw">Hébreu</option>
              <option value="hil">Hiligaïnon</option>
              <option value="hi">Hindi</option>
              <option value="hmn">Hmong</option>
              <option value="hu">Hongrois</option>
              <option value="hrx">Hunsrik</option>
              <option value="iba">Iban</option>
              <option value="ig">Igbo</option>
              <option value="ilo">Ilocano</option>
              <option value="id">Indonésien</option>
              <option value="iu-Latn">Inuktut (latin)</option>
              <option value="iu">Inuktut (syllabique)</option>
              <option value="ga">Irlandais</option>
              <option value="is">Islandais</option>
              <option value="it">Italien</option>
              <option value="ja">Japonais</option>
              <option value="jw">Javanais</option>
              <option value="kac">Jingpo</option>
              <option value="kl">Kalaallisut</option>
              <option value="kn">Kannada</option>
              <option value="kr">Kanuri</option>
              <option value="kk">Kazakh</option>
              <option value="kha">Khasi</option>
              <option value="km">Khmer</option>
              <option value="cgg">Kiga</option>
              <option value="kg">Kikongo</option>
              <option value="rw">Kinyarwanda</option>
              <option value="ky">Kirghiz</option>
              <option value="ktu">Kituba</option>
              <option value="trp">Kok Borok</option>
              <option value="kv">Komi</option>
              <option value="gom">Konkani</option>
              <option value="kri">Krio</option>
              <option value="ku">Kurde (Kurmandji)</option>
              <option value="ckb">Kurde (Sorani)</option>
              <option value="lo">Laotien</option>
              <option value="ltg">Latgalien</option>
              <option value="la">Latin</option>
              <option value="lv">Letton</option>
              <option value="lij">Ligure</option>
              <option value="li">Limbourgeois</option>
              <option value="ln">Lingala</option>
              <option value="lt">Lituanien</option>
              <option value="lmo">Lombard</option>
              <option value="lg">Luganda</option>
              <option value="luo">Luo</option>
              <option value="lb">Luxembourgeois</option>
              <option value="mak">Macassar</option>
              <option value="mk">Macédonien</option>
              <option value="mad">Madurais</option>
              <option value="mai">Maïthili</option>
              <option value="ms-Arab">Malais (Jawi)</option>
              <option value="ms">Malaisien</option>
              <option value="ml">Malayalam</option>
              <option value="mg">Malgache</option>
              <option value="mt">Maltais</option>
              <option value="mam">Mam</option>
              <option value="gv">Manx</option>
              <option value="mi">Maori</option>
              <option value="mr">Marathi</option>
              <option value="chm">Mari des prairies</option>
              <option value="mh">Marshallais</option>
              <option value="mwr">Marwari</option>
              <option value="yua">Maya yucatèque</option>
              <option value="mni-Mtei">Meitei (Manipuri)</option>
              <option value="min">Minangkabau</option>
              <option value="lus">Mizo</option>
              <option value="mn">Mongol</option>
              <option value="bm-Nkoo">N'ko</option>
              <option value="nhe">Nahuatl (Huasteca oriental)</option>
              <option value="ndc-ZW">Ndau</option>
              <option value="nr">Ndébélé (Sud)</option>
              <option value="nl">Néerlandais</option>
              <option value="ne">Népalais</option>
              <option value="new">Nepalbhasha (Newari)</option>
              <option value="no">Norvégien</option>
              <option value="nus">Nuer</option>
              <option value="oc">Occitan</option>
              <option value="or">Odia (Oriya)</option>
              <option value="om">Oromo</option>
              <option value="os">Ossète</option>
              <option value="udm">Oudmourte</option>
              <option value="ug">Ouïgour</option>
              <option value="uz">Ouzbek</option>
              <option value="ps">Pachtô</option>
              <option value="pam">Pampangan</option>
              <option value="pag">Pangasinan</option>
              <option value="pa">Panjabi (Gurmukhi)</option>
              <option value="pa-Arab">Panjabi (Shahmukhi)</option>
              <option value="pap">Papiamento</option>
              <option value="jam">Patois jamaïcain</option>
              <option value="fa">Persan</option>
              <option value="ff">Peul</option>
              <option value="tl">Philippin</option>
              <option value="pl">Polonais</option>
              <option value="pt">Portugais (Brésil)</option>
              <option value="pt-PT">Portugais (Portugal)</option>
              <option value="kek">Q'eqchi'</option>
              <option value="qu">Quechua</option>
              <option value="rom">Romani</option>
              <option value="ro">Roumain</option>
              <option value="rn">Roundi</option>
              <option value="ru">Russe</option>
              <option value="se">Same (Nord)</option>
              <option value="sm">Samoan</option>
              <option value="sg">Sango</option>
              <option value="sa">Sanskrit</option>
              <option value="sat-Latn">Santali (latin)</option>
              <option value="sat">Santali (ol chiki)</option>
              <option value="nso">Sepedi</option>
              <option value="sr">Serbe</option>
              <option value="st">Sesotho</option>
              <option value="shn">Shan</option>
              <option value="sn">Shona</option>
              <option value="scn">Sicilien</option>
              <option value="szl">Silésien</option>
              <option value="sd">Sindhî</option>
              <option value="sk">Slovaque</option>
              <option value="sl">Slovène</option>
              <option value="so">Somali</option>
              <option value="su">Soundanais</option>
              <option value="sus">Soussou</option>
              <option value="sv">Suédois</option>
              <option value="sw">Swahili</option>
              <option value="ss">Swati</option>
              <option value="tg">Tadjik</option>
              <option value="ty">Tahitien</option>
              <option value="ber-Latn">Tamazight</option>
              <option value="ber">Tamazight (Tifinagh)</option>
              <option value="ta">Tamoul</option>
              <option value="tt">Tatar</option>
              <option value="crh">Tatar de Crimée (cyrillique)</option>
              <option value="crh-Latn">Tatar de Crimée (latin)</option>
              <option value="cs">Tchèque</option>
              <option value="ce">Tchétchène</option>
              <option value="cv">Tchouvache</option>
              <option value="te">Telugu</option>
              <option value="tet">Tétoum</option>
              <option value="th">Thaï</option>
              <option value="bo">Tibétain</option>
              <option value="ti">Tigrigna</option>
              <option value="tiv">Tiv</option>
              <option value="tpi">Tok pisin</option>
              <option value="to">Tongien</option>
              <option value="tcy">Toulou</option>
              <option value="tyv">Touvain</option>
              <option value="lua">Tshiluba</option>
              <option value="ts">Tsonga</option>
              <option value="tn">Tswana</option>
              <option value="tum">Tumbuka</option>
              <option value="tr">Turc</option>
              <option value="tk">Turkmène</option>
              <option value="ak">Twi</option>
              <option value="uk">Ukrainien</option>
              <option value="ur">Urdu</option>
              <option value="ve">Venda</option>
              <option value="vec">Vénitien</option>
              <option value="vi">Vietnamien</option>
              <option value="war">Waray-waray</option>
              <option value="wo">Wolof</option>
              <option value="xh">Xhosa</option>
              <option value="sah">Yakoute</option>
              <option value="yi">Yiddish</option>
              <option value="yo">Yoruba</option>
              <option value="zap">Zapotèque</option>
              <option value="zu">Zoulou</option>
              {/* Add more languages as needed */}
            </select>
          </div>
          <div className="flex justify-between items-center p-6 pb-0">
            {/* <p className="text-lg">Dark Mode</p>
            <DarkModeToggle /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
