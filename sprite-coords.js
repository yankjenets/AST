/* Alaskan State Troopers - the Game
 *
 * Based off of the hit National Geographic television show.
 *
 * Designed and developed by:
 * Daniel Deutsch - ddeutsch
 * Tyler Healy - thealy
 * Michael Hankowsky - mhankows
 */
 
var mooseCoords = new Object();
mooseCoords["down"] = new Object();
mooseCoords["right"] = new Object();
mooseCoords["left"] = new Object();
mooseCoords["up"] = new Object();

mooseCoords["down"][0] = {"x":44, "y":52, "w":29, "h":64};
mooseCoords["down"][1] = {"x":159, "y":50, "w":30, "h":63};
mooseCoords["down"][2] = {"x":275, "y":52, "w":30, "h":64};

mooseCoords["left"][0] = {"x":14, "y":177, "w":82, "h":55};
mooseCoords["left"][1] = {"x":130, "y":174, "w":79, "h":58};
mooseCoords["left"][2] = {"x":246, "y":179, "w":81, "h":53};

mooseCoords["right"][0] = {"x":23, "y":295, "w":79, "h":53};
mooseCoords["right"][1] = {"x":140, "y":291, "w":78, "h":75};
mooseCoords["right"][2] = {"x":255, "y":293, "w":79, "h":55};

mooseCoords["up"][0] = {"x":42, "y":402, "w":30, "h":62};
mooseCoords["up"][1] = {"x":159, "y":402, "w":30, "h":59};
mooseCoords["up"][2] = {"x":275, "y":404, "w":30, "h":60};

var policeCoords = new Object();
policeCoords["off"] = new Object();
policeCoords["on"] = new Object();

policeCoords["off"][0] = {"x":3, "y":0, "w":36, "h":78};

policeCoords["on"][0] = policeCoords["off"][0]
policeCoords["on"][1] = {"x":3, "y":128, "w":36, "h":78};
policeCoords["on"][2] = {"x":3, "y":256, "w":36, "h":78};
policeCoords["on"][3] = {"x":3, "y":384, "w":36, "h":78};
policeCoords["on"][4] = {"x":3, "y":512, "w":36, "h":78};
policeCoords["on"][5] = {"x":3, "y":640, "w":36, "h":78};
policeCoords["on"][6] = {"x":3, "y":768, "w":36, "h":78};
policeCoords["on"][7] = {"x":3, "y":896, "w":36, "h":78};

var explosionCoords = new Object();
explosionCoords["on"] = new Object();
explosionCoords["off"] = new Object();

explosionCoords["on"][0] = {"x":3, "y":29, "w":47, "h":40};
explosionCoords["on"][1] = {"x":66, "y":33, "w":44, "h":36};
explosionCoords["on"][2] = {"x":127, "y":12, "w":48, "h":57};
explosionCoords["on"][3] = {"x":200, "y":8, "w":46, "h":61};
explosionCoords["on"][4] = {"x":266, "y":6, "w":47, "h":63};
explosionCoords["on"][5] = {"x":322, "y":7, "w":48, "h":62};
explosionCoords["on"][6] = {"x":383, "y":6, "w":48, "h":63};
explosionCoords["on"][7] = {"x":445, "y":6, "w":41, "h":55};

explosionCoords["off"][0] = {"x":513, "y":2, "w":40, "h":64};
explosionCoords["off"][1] = {"x":576, "y":0, "w":37, "h":66};
explosionCoords["off"][2] = {"x":641, "y":1, "w":31, "h":65};

var blueCarCoords = new Object();
blueCarCoords["on"] = new Object();
blueCarCoords["on"][0] = {"x":0, "y":0, "w":42, "h":78};

var truckCoords = new Object();
truckCoords["on"] = new Object();
truckCoords["on"][0] = {"x":2, "y":4, "w":44, "h":99};

var greyCarCoords = new Object();
greyCarCoords["on"] = new Object();
greyCarCoords["on"][0] = {"x":0, "y":0, "w":42, "h":78};

var yellowCarCoords = greyCarCoords;

var cuffCords = new Object();
cuffCords["on"] = new Object();
cuffCords["on"][0] = {"x":0, "y":0, "w":62, "h":37};
