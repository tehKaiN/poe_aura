g_RmrInputs = [];

g_AurasPercent = {
	'anger': {name: "Anger", icon: 'aurafire', effect: 'Fire dmg', resvd: 50},
	'determ': {name: "Determination", icon: 'auraarmour', effect: 'Armour', resvd: 50},
	'discipline': {name: "Discipline", icon: 'auraenergy', effect: 'Ene shield', resvd: 35},
	'grace': {name: "Grace", icon: 'auraevasion', effect: 'Evasion', resvd: 50},
	'haste': {name: "Haste", icon: 'auraspeed', effect: 'Speed', resvd: 50},
	'hatred': {name: "Hatred", icon: 'auracold', effect: 'Cold dmg', resvd: 50},
	'malev': {name: "Malevolence", icon: 'DeliriumAura', effect: 'DoT, skill dur', resvd: 50},
	'pride': {name: "Pride", icon: 'auradamage', effect: 'Phys dmg', resvd: 50},
	'purele': {name: "Purity of Elements", icon: 'auraresist', effect: 'Res', resvd: 35},
	'purfire': {name: "Purity of Fire", abbr: 'PoF', icon: 'aurafireresist', effect: 'Res', resvd: 35},
	'purice': {name: "Purity of Ice", abbr: 'PoI', icon: 'auracoldresist', effect: 'Res', resvd: 35},
	'purlight': {name: "Purity of Lightning", abbr: 'PoL', icon: 'auralightningresist', effect: 'Res', resvd: 35},
	'wrath': {name: "Wrath", icon: 'auralightning', effect: 'Lightning dmg', resvd: 50},
	'zeal': {name: "Zealotry", icon: 'SpellDamageAura', effect: 'Consecr gnd', resvd: 50},
};

g_AurasPoints = {
	'vit': {name: "Vitality", icon: 'auraregen', effect: 'Life regen', resvd: [ 0,
		 28,  40,  51,  63,  74,  85,  96, 108, 118, 128,
		138, 148, 158, 169, 178, 189, 199, 209, 221, 233,
		244, 253, 261, 269, 278, 286, 294, 303, 311, 319,
		338, 348, 358, 368, 379, 389, 399, 409, 419, 429
	]},
	'clar': {name: "Clarity", icon: 'auramana', effect: 'Mana regen', resvd: [ 0,
		 34,  48,  61,  76,  89, 102, 115, 129, 141, 154,
		166, 178, 190, 203, 214, 227, 239, 251, 265, 279,
		293, 303, 313, 323, 333, 343, 353, 363, 373, 383,
		406, 418, 430, 442, 455, 467, 479, 491, 503, 515
	]},
	'prec': {name: "Precision", icon: 'auracrit', effect: 'Accuracy', resvd: [ 0,
		 22,  32,  40,  50,  59,  68,  76,  86,  94,  102,
		 110, 118, 126, 135, 142, 151, 159, 167, 176, 186,
		 195, 202, 208, 215, 222, 228, 235, 242, 248, 255,
		 270, 278, 286, 294, 303, 311, 319, 327, 335, 343
	]},
};

g_BloodMagic = [ 0,
	245, 242, 239, 237, 234, 232, 229, 226, 224, 221,
	218, 216, 213, 211, 208, 205, 203, 200, 197, 196,
	193, 190, 187, 184, 181, 178, 175, 172, 169, 166,
	164, 163, 162, 160, 158, 157, 156, 154, 152, 151
];

g_Passives = {
	'sov': {name: 'Sovereignty', rmr: [4, 4, 6], icon: 'sovereignty'},
	'lead': {name: 'Leadership', rmr: [4], icon: 'leadership'},
	'infl': {name: 'Influence', rmr: [4], icon: 'influence'},
	'char': {name: 'Charisma', rmr: [4, 8], icon: 'authority'},
	'cotc': {name: 'Champion of the cause', rmr: [4], icon: 'Champion'}
};

g_Clusters = {
	pure_aptitude: {name: 'Pure Aptitude', affects: 'purlight', rmr: 30, icon: 'LightningResistNotable'},
	pure_guile: {name: 'Pure Guile', affects: 'purice', rmr: 30, icon: 'ColdResistNotable'},
	pure_might: {name: 'Pure Might', affects: 'purfire', rmr: 30, icon: 'FireResistNotable'},
	self_control: {name: 'Self-Control', affects: 'discipline', rmr: 30, icon: 'EnergyShieldNotable'},
	sublime_form: {name: 'Sublime Form', affects: 'grace', rmr: 30, icon: 'EvasionNotable'},
	uncompromising: {name: 'Uncompromising', affects: 'determ', rmr: 30, icon: 'ArmourNotable'},
};

function getRmrFromClustersForAura(AuraCodeName) {
	var Rmr = 0;
	for(var ClusterCode in g_Clusters) {
		var Cluster = g_Clusters[ClusterCode];
		if(Cluster.affects == AuraCodeName) {
			// Check how many clusters are enabled
			Rmr += Cluster.rmr * parseInt(document.clusters[ClusterCode].value);
		}
	}
	return Rmr;
}

function recalcReserved() {
	// Calc mask of the tribunal
	var MaskRoll = 25;
	var Attribs = (
		parseInt(document.char.str.value) +
		parseInt(document.char.ag.value) +
		parseInt(document.char.int.value) + 3 * MaskRoll
	);
	var RmrMask = Math.floor(Attribs / 250);
	document.inventory.item_mask.value = RmrMask;
	document.getElementById('item_mask_res').innerHTML = `(${RmrMask})`;

	// Calc global RMR
	var RmrChar = 0;
	for(var i = 0; i < g_RmrInputs.length; ++i) {
		var Input = g_RmrInputs[i];
		if(Input.checked) {
			RmrChar += parseInt(Input.value);
		}
	}
	document.getElementById('rmr_total').innerHTML = `Tree + inventory RMR: ${RmrChar}%`;

	// Blood magic multiplier
	var BloodMagicMult = g_BloodMagic[document.inventory.bm_lvl.value];
	document.getElementById('bm_mana_mult').innerHTML = `Multiplier: ${BloodMagicMult}%`;

	// Calc reservation
	var TotalLife = parseInt(document.char.life.value);
	var TotalMana = parseInt(document.char.mana.value);
	var ReservedManaPercent = 0;
	var ReservedManaPoints = 0;
	var ReservedLifePercent = 0;
	var ReservedLifePoints = 0;
	var AurasEnabled = 0;
	for(var AuraName in  g_AurasPercent) {
		var AuraDef = g_AurasPercent[AuraName];
		var InputGroup = document.auras['group_' + AuraName];
		var ElementReserved = document.getElementById(`reserved_${AuraName}`);
		if(InputGroup.value != 'off') {
			++AurasEnabled;
			var ManaMultiplier = 100;
			var Rmr = RmrChar;
			var isLife = false;
			if(InputGroup.value == 'pg') {
				// Prism guardian
				Rmr += 25;
				isLife = true;
			}
			else if(InputGroup.value == 'bm') {
				// Blood magic
				ManaMultiplier *= BloodMagicMult / 100;
				isLife = true;
			}
			Rmr += getRmrFromClustersForAura(AuraName);
			var ReservedPercentForThisAura = Math.ceil(Math.floor(AuraDef.resvd * (ManaMultiplier / 100)) * (100 - (Rmr)) / 100);
			if(isLife) {
				ReservedLifePercent += ReservedPercentForThisAura;
				ReservedPointsForThisAura = Math.ceil(TotalLife * ReservedPercentForThisAura / 100);
				ReservedLifePoints += ReservedPointsForThisAura;
				ElementReserved.parentElement.lastElementChild.className = 'life';
			}
			else {
				ReservedManaPercent += ReservedPercentForThisAura;
				ReservedPointsForThisAura = Math.ceil(TotalMana * ReservedPercentForThisAura / 100);
				ReservedManaPoints += ReservedPointsForThisAura;
				ElementReserved.parentElement.lastElementChild.className = 'mana';
			}
			ElementReserved.innerHTML = `${ReservedPointsForThisAura} (${ReservedPercentForThisAura}%)`;
			ElementReserved.parentElement.className = '';
		}
		else {
			ElementReserved.innerHTML = '';
			ElementReserved.parentElement.className = 'disabled';
		}
	}

	var FreeLife = TotalLife - ReservedLifePoints;
	var FreeMana = TotalMana - ReservedManaPoints;
	document.getElementById('reserve_life').innerHTML = `Reserved life from percentage-based: ${ReservedLifePoints} (${ReservedLifePercent}%), Free: ${FreeLife}`;
	document.getElementById('reserve_mana').innerHTML = `Reserved mana from percentage-based: ${ReservedManaPoints} (${ReservedManaPercent}%), Free: ${FreeMana}`;

	ReservedManaPoints = 0;
	ReservedLifePoints = 0;
	for(var AuraName in g_AurasPoints) {
		var AuraDef = g_AurasPoints[AuraName];
		var InputGroup = document.auras_points[`group_point_${AuraName}`];
		var ElementReserved = document.getElementById(`reserved_point_${AuraName}`);
		if(InputGroup.value != 'off') {
			++AurasEnabled;
			var ManaMultiplier = 100;
			var Rmr = RmrChar;
			var isLife = false;
			if(InputGroup.value == 'pg') {
				// Prism guardian
				Rmr += 25;
				isLife = true;
			}
			else if(InputGroup.value == 'bm') {
				// Blood magic
				ManaMultiplier *= BloodMagicMult / 100;
				isLife = true;
			}
			var ElementLevel = document.auras_points[`level_${AuraName}`];
			var BaseReserved = AuraDef.resvd[ElementLevel.value];
			document.getElementById(`rsvd_${AuraName}`).innerHTML = BaseReserved;
			var ReservedPointsForThisAura = Math.ceil(Math.floor(BaseReserved * (ManaMultiplier / 100)) * (100 - (Rmr)) / 100);
			var ReservedPercentForThisAura;
			if(isLife) {
				ReservedLifePoints += ReservedPointsForThisAura;
				ReservedPercentForThisAura = Math.ceil(ReservedPointsForThisAura / TotalLife * 100);
				ElementReserved.parentElement.lastElementChild.className = 'life';
			}
			else {
				ReservedManaPoints += ReservedPointsForThisAura;
				ReservedPercentForThisAura = Math.ceil(ReservedPointsForThisAura / TotalMana * 100);
				ElementReserved.parentElement.lastElementChild.className = 'mana';
			}
			ElementReserved.innerHTML = `${ReservedPointsForThisAura} (${ReservedPercentForThisAura}%)`;
			ElementReserved.parentElement.className = '';
		}
		else {
			ElementReserved.innerHTML = '';
			ElementReserved.parentElement.className = 'disabled';
			document.getElementById(`rsvd_${AuraName}`).innerHTML = '';
		}
	}
	FreeLife -= ReservedLifePoints;
	FreeMana -= ReservedManaPoints;
	var FreeLifePercent = Math.floor(FreeLife / TotalLife * 100);
	var FreeManaPercent = Math.floor(FreeMana / TotalMana * 100);
	document.getElementById('reserve_life_point').innerHTML = `Point-based reserve life: ${ReservedLifePoints}, free: ${FreeLife} (${FreeLifePercent}%)`;
	document.getElementById('reserve_mana_point').innerHTML = `Point-based reserve mana: ${ReservedManaPoints}, free: ${FreeMana} (${FreeManaPercent}%)`;

	document.getElementById('auras_enabled').innerHTML = `Auras enabled: ${AurasEnabled}`;
}

function makeSensitiveToChange(Collection) {
	for(Element of Collection) {
		Element.onchange = recalcReserved;
		Element.onkeyup = recalcReserved;
		if(Element.type == 'text' && Element.min != '' && Element.max != '') {
			Element.onwheel = function(Evt) {
				Evt.preventDefault();
				var NewVal = parseInt(Evt.target.value) - Math.sign(Evt.deltaY);
				if(NewVal > Evt.target.max) {
					NewVal = Evt.target.max;
				}
				else if(NewVal < Evt.target.min) {
					NewVal = Evt.target.min;
				}
				if(Evt.target.value != NewVal) {
					Evt.target.value = NewVal;
					recalcReserved();
				}
			}
		}
	}
}

function initUiPassives() {
	// Create passives checkboxes
	for(var PassiveCode in g_Passives) {
		var Passive = g_Passives[PassiveCode];
		var RmrString = '';
		var RmrTotal = 0;
		if (typeof(Passive.rmr) == 'number') {
			Passive.rmr = [Passive.rmr];
		}
		for(var RmrNode of Passive.rmr) {
			RmrTotal += RmrNode;
			if(RmrString.length) {
				RmrString += ' + ';
			}
			RmrString += RmrNode;
		}
		document.passives.innerHTML += `
			<div class="option"><label>
			<img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/passives/${Passive.icon}.png?scale=1" class="icon">
			${Passive.name} (${RmrString})<input type="checkbox" name="passive_${PassiveCode}" value="${RmrTotal}">
			</label></div>
		`;
	}
}

function initUiClusters() {
	// Create cluster checkboxes
	for(var ClusterCode in g_Clusters) {
		var Cluster = g_Clusters[ClusterCode];
		var AffectsAura = g_AurasPercent[Cluster.affects];
		if(!AffectsAura) {
			AffectsAura = g_AurasPoints[Cluster.affects];
		}
		var AffectsName = AffectsAura.name;
		if(AffectsAura.abbr) {
			AffectsName = `<abbr title="${AffectsName}">${AffectsAura.abbr}</abbr>`;
		}
		document.clusters.innerHTML += `
			<div class="option"><label>
			<img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/passives/${Cluster.icon}.png?scale=1" class="icon">
			${Cluster.name} (${AffectsName} ${Cluster.rmr}%)
			<input class="cluster" name="${ClusterCode}" value="0" min="0" max="5">
			</label></div>
		`;
	}
}

function initUiAuraPoints() {
	// Point-based auras
	for(var AuraCode in g_AurasPoints) {
		var Aura = g_AurasPoints[AuraCode];
		document.getElementById('table_aura_points').innerHTML += `
			<tr>
			<td><img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/${Aura.icon}.png?" class="icon">${Aura.name}</td><td>${Aura.effect}</td>
			<td><input name="level_${AuraCode}" value="20" min="1" max="40" class="gem_lvl"></td>
			<td id="rsvd_${AuraCode}"></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="off" checked="checked"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="mana"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="bm"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="pg"></label></td>
			<td id="reserved_point_${AuraCode}"></td>
			</tr>
		`;
	}
}

function initUiAuraPercent(Label, AuraCodes) {
	// Header
	document.getElementById('table_aura_percent').innerHTML += `
		<tr><td colspan="8" class="sep">Offence</td></tr>
	`;

	// Auras
	for(var AuraCode of AuraCodes) {
		var Aura = g_AurasPercent[AuraCode];
		document.getElementById('table_aura_percent').innerHTML += `
			<tr>
				<td><img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/${Aura.icon}.png?" class="icon">${Aura.name}</td><td>${Aura.effect}</td>
				<td>${Aura.resvd}</td>
				<td><label><input type="radio" name="group_${AuraCode}" value="off" checked="checked"></label></td>
				<td><label><input type="radio" name="group_${AuraCode}" value="mana"></label></td>
				<td><label><input type="radio" name="group_${AuraCode}" value="bm"></label></td>
				<td><label><input type="radio" name="group_${AuraCode}" value="pg"></label></td>
				<td id="reserved_${AuraCode}"></td>
			</tr>
		`;
	}
}

function calcMain() {
	initUiPassives();
	initUiClusters();
	initUiAuraPoints();
	initUiAuraPercent('Offence', ['anger', 'hatred', 'wrath', 'pride', 'malev', 'zeal']);
	initUiAuraPercent('Defence', ['determ', 'discipline', 'grace', 'haste', 'purele', 'purfire', 'purice', 'purlight']);

	// Get all RMR inventory/passive inputs
	var Inputs = document.passives.getElementsByTagName('input');
	for(var i = 0; i < Inputs.length; ++i) {
		g_RmrInputs.push(Inputs[i]);
	}
	var Inputs = document.inventory.getElementsByTagName('input');
	for(var i = 0; i < Inputs.length; ++i) {
		g_RmrInputs.push(Inputs[i]);
	}

	makeSensitiveToChange(g_RmrInputs);
	makeSensitiveToChange(document.auras.getElementsByTagName('input'));
	makeSensitiveToChange(document.auras_points.getElementsByTagName('input'));
	makeSensitiveToChange(document.clusters.getElementsByTagName('input'));
	makeSensitiveToChange(document.char.getElementsByTagName('input'));

	recalcReserved();
}

window.addEventListener("load", calcMain);
