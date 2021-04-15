//------------------------------------------------------------------------- UTIL

$ = function(x) {return document.querySelector(x);};
$$ = function(x) {return document.querySelectorAll(x);};

function bitsToBytes(Bits) {
	// Expand array to have round amount of bits, fill with zeros
	var Expanded = [...Bits];
	while(Expanded.length % 8 != 0) {
		Expanded.push(0);
	}

	// Pack to bytes
	var Bytes = new Uint8Array(Expanded.length / 8);
	var BytePos = 0;
	var BitPos = 0;
	for(Bit of Expanded) {
		Bytes[BytePos] = (Bytes[BytePos] << 1) | Bit;
		if(++BitPos == 8) {
			BitPos = 0;
			++BytePos;
		}
	}
	return Bytes;
}

function bytesToBits(Bytes) {
	var Bits = [];
	for(Byte of Bytes) {
		for(ByteBit = 128; ByteBit > 0; ByteBit >>= 1) {
			if(Byte & ByteBit) {
				Bits.push(1);
			}
			else {
				Bits.push(0);
			}
		}
	}
	return Bits;
}

function mergeArrays(Arrays) {
	var TotalLength = 0;
	for(Arr of Arrays) {
		TotalLength += Arr.byteLength;
		console.log('addlength: ' + Arr.byteLength);
	}

	var Out = new Uint8Array(TotalLength);
	var Offs = 0;
	for(Arr of Arrays) {
		Out.set(Arr, Offs);
		Offs += Arr.byteLength;
	}
	return Out;
}

//------------------------------------------------------------------------- MAIN

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
	'heraldice': {name: "Herald of Ice", icon: 'HeraldofIce', effect: 'Cold dmg', resvd: 25},
	'heraldthunder': {name: "Herald of Thunder", icon: 'HeraldofThunder', effect: 'Lightning dmg', resvd: 25},
	'heraldash': {name: "Herald of Ash", icon: 'HeraldofAsh', effect: 'Fire dmg', resvd: 25},
	'heraldpurity': {name: "Herald of Purity", icon: 'HeraldOfLight', effect: 'Sentinels', resvd: 25},
	'heraldagony': {name: "Herald of Agony", icon: 'HeraldOfAgony', effect: 'Crawler', resvd: 25},
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
			Rmr += Cluster.rmr * parseInt(document.calc['cluster_' + ClusterCode].value);
		}
	}
	return Rmr;
}

function recalcReserved() {
	// Calc mask of the tribunal
	var MaskRoll = 25;
	var Attribs = (
		parseInt(document.calc.char_str.value) +
		parseInt(document.calc.char_dex.value) +
		parseInt(document.calc.char_int.value) + 3 * MaskRoll
	);
	var RmrTribunal = Math.floor(Attribs / 250);
	document.calc.item_mask.value = RmrTribunal;
	$('#item_mask_res').innerHTML = `(${RmrTribunal})`;

	// Calc global RMR
	var RmrChar = 0;
	for(var i = 0; i < g_RmrInputs.length; ++i) {
		var Input = g_RmrInputs[i];
		if(Input.type == 'checkbox') {
			if(Input.checked) {
				RmrChar += parseInt(Input.value);
			}
		}
		else {
			RmrChar += parseInt(Input.value);
		}
	}
	$('#rmr_total').innerHTML = `Tree + inventory RMR: ${RmrChar}%`;

	// Blood magic multiplier
	var BloodMagicMult = g_BloodMagic[document.calc.bm_lvl.value];
	$('#bm_mana_mult').innerHTML = `Multiplier: ${BloodMagicMult}%`;

	// Calc reservation
	var TotalLife = parseInt(document.calc.char_life.value);
	var TotalMana = parseInt(document.calc.char_mana.value);
	var ReservedManaPoints = 0;
	var ReservedLifePoints = 0;
	var AurasEnabled = 0;
	for(var AuraName in  g_AurasPercent) {
		var AuraDef = g_AurasPercent[AuraName];
		var InputGroup = document.calc['group_' + AuraName];
		var ElementReserved = $(`#reserved_${AuraName}`);
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
				if(document.calc.bm_qty.checked) {
					Rmr += 1;
				}
			}
			Rmr += getRmrFromClustersForAura(AuraName);
			var ReservedPercentForThisAura = Math.ceil(Math.floor(AuraDef.resvd * (ManaMultiplier / 100)) * (100 - (Rmr)) / 10) / 10;
			if(isLife) {
				ReservedPointsForThisAura = Math.ceil(TotalLife * ReservedPercentForThisAura / 100);
				ReservedLifePoints += ReservedPointsForThisAura;
				ElementReserved.parentElement.lastElementChild.className = 'life';
			}
			else {
				ReservedPointsForThisAura = Math.ceil(TotalMana * ReservedPercentForThisAura / 100);
				ReservedManaPoints += ReservedPointsForThisAura;
				ElementReserved.parentElement.lastElementChild.className = 'mana';
			}
			ElementReserved.innerHTML = `${ReservedPointsForThisAura} (${ReservedPercentForThisAura}%)`;
			ElementReserved.parentElement.classList.remove('disabled');
		}
		else {
			ElementReserved.innerHTML = '';
			ElementReserved.parentElement.classList.add('disabled');
		}
	}

	var FreeLife = TotalLife - ReservedLifePoints;
	var FreeMana = TotalMana - ReservedManaPoints;
	var ReservedLifePercent = Math.ceil((ReservedLifePoints / TotalLife) * 1000) / 10;
	var ReservedManaPercent = Math.ceil((ReservedManaPoints / TotalMana) * 1000) / 10;
	$('#reserve_life').innerHTML = `
		Reserved life from percentage-based:
		${ReservedLifePoints} (${ReservedLifePercent}%), Free: ${FreeLife}
	`;
	$('#reserve_mana').innerHTML = `
		Reserved mana from percentage-based:
		${ReservedManaPoints} (${ReservedManaPercent}%), Free: ${FreeMana}
	`;

	ReservedManaPoints = 0;
	ReservedLifePoints = 0;
	for(var AuraName in g_AurasPoints) {
		var AuraDef = g_AurasPoints[AuraName];
		var InputGroup = document.calc[`group_point_${AuraName}`];
		var ElementReserved = $(`#reserved_point_${AuraName}`);
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
			var ElementLevel = document.calc[`level_${AuraName}`];
			var BaseReserved = AuraDef.resvd[ElementLevel.value];
			$(`#rsvd_${AuraName}`).innerHTML = BaseReserved;
			var ReservedPointsForThisAura = Math.ceil(Math.floor(BaseReserved * (ManaMultiplier / 100)) * (100 - (Rmr)) / 100);
			var ReservedPercentForThisAura;
			if(isLife) {
				ReservedLifePoints += ReservedPointsForThisAura;
				ReservedPercentForThisAura = Math.ceil(ReservedPointsForThisAura / TotalLife * 1000) / 10;
				ElementReserved.parentElement.lastElementChild.className = 'life';
			}
			else {
				ReservedManaPoints += ReservedPointsForThisAura;
				ReservedPercentForThisAura = Math.ceil(ReservedPointsForThisAura / TotalMana * 1000) / 10;
				ElementReserved.parentElement.lastElementChild.className = 'mana';
			}
			ElementReserved.innerHTML = `${ReservedPointsForThisAura} (${ReservedPercentForThisAura}%)`;
			ElementReserved.parentElement.classList.remove('disabled');
		}
		else {
			ElementReserved.innerHTML = '';
			ElementReserved.parentElement.classList.add('disabled');
			$(`#rsvd_${AuraName}`).innerHTML = '';
		}
	}
	FreeLife -= ReservedLifePoints;
	FreeMana -= ReservedManaPoints;
	var FreeLifePercent = Math.floor(FreeLife / TotalLife * 1000) / 10;
	var FreeManaPercent = Math.floor(FreeMana / TotalMana * 1000) / 10;
	$('#reserve_life_point').innerHTML = `Point-based reserve life: ${ReservedLifePoints}, free: ${FreeLife} (${FreeLifePercent}%)`;
	$('#reserve_mana_point').innerHTML = `Point-based reserve mana: ${ReservedManaPoints}, free: ${FreeMana} (${FreeManaPercent}%)`;

	$('#auras_enabled').innerHTML = `Auras enabled: ${AurasEnabled}`;
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
		var Div = document.createElement('div');
		Div.classList.add('option');
		Div.innerHTML = `
			<label>
			<img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/passives/${Passive.icon}.png?scale=1" class="icon">
			${Passive.name} (${RmrString})<input type="checkbox" name="passive_${PassiveCode}" value="${RmrTotal}">
			</label>
		`;
		$('#passive_ctl').appendChild(Div);
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
		var Div = document.createElement('div');
		Div.classList.add('option');
		Div.innerHTML = `
			<label>
			<img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/passives/${Cluster.icon}.png?scale=1" class="icon">
			${Cluster.name} (${AffectsName} ${Cluster.rmr}%)
			<input class="cluster" name="cluster_${ClusterCode}" value="0" min="0" max="5">
			</label>
		`;
		$('#cluster_ctl').appendChild(Div);
	}
}

function initUiAuraPoints() {
	// Point-based auras
	for(var AuraCode in g_AurasPoints) {
		var Aura = g_AurasPoints[AuraCode];
		var Row = document.createElement('tr');
		Row.innerHTML = `
			<td><img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/${Aura.icon}.png?" class="icon">${Aura.name}</td><td>${Aura.effect}</td>
			<td><input name="level_${AuraCode}" value="20" min="1" max="40" class="input_small"></td>
			<td id="rsvd_${AuraCode}"></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="off" checked="checked"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="mana"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="bm"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="pg"></label></td>
			<td id="reserved_point_${AuraCode}"></td>
		`;
		$('#table_aura_points').appendChild(Row);
	}
}

function initUiAuraPercent(Label, AuraCodes) {
	// Header
	var Row = document.createElement('tr');
	Row.innerHTML = `<td colspan="8" class="sep">${Label}</td>`;
	$('#table_aura_percent').appendChild(Row);

	// Auras
	for(var AuraCode of AuraCodes) {
		var Aura = g_AurasPercent[AuraCode];
		Row = document.createElement('tr');
		Row.innerHTML = `
			<td><img src="https://web.poecdn.com/image/Art/2DArt/SkillIcons/${Aura.icon}.png?" class="icon">${Aura.name}</td><td>${Aura.effect}</td>
			<td>${Aura.resvd}</td>
			<td><label><input type="radio" name="group_${AuraCode}" value="off" checked="checked"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="mana"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="bm"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="pg"></label></td>
			<td id="reserved_${AuraCode}"></td>
		`;
		$('#table_aura_percent').appendChild(Row);
	}
}

function toggleDisabledVisibility() {
	Rows = $$('tr.disabled');
	for(Row of Rows) {
		if(document.settings.hide_disabled.checked) {
			Row.classList.add('row_hidden');
		}
		else {
			Row.classList.remove('row_hidden');
		}
	}
}

// Fields to export - fixed order to maintain forwards compatibility
g_ExportFields = [
	{input_name: 'bm_qty', type: 'checkbox'},
	{input_name: 'item_alpha', type: 'checkbox'},
	{input_name: 'item_amulet_fertile', type: 'checkbox'},
	{input_name: 'item_amulet_simplex', type: 'checkbox'},
	{input_name: 'item_skyforth', type: 'checkbox'},
	{input_name: 'item_mask', type: 'checkbox'},
	{input_name: 'item_conq', type: 'checkbox'},
	{input_name: 'item_conq_impljew', type: 'checkbox'},
	{input_name: 'passive_sov', type: 'checkbox'},
	{input_name: 'passive_lead', type: 'checkbox'},
	{input_name: 'passive_infl', type: 'checkbox'},
	{input_name: 'passive_char', type: 'checkbox'},
	{input_name: 'passive_cotc', type: 'checkbox'},
	{input_name: 'hide_disabled', type: 'checkbox'},
	{input_name: 'item_amulet_redeemer', type: 'int'},
	{input_name: 'char_str', type: 'int'},
	{input_name: 'char_dex', type: 'int'},
	{input_name: 'char_int', type: 'int'},
	{input_name: 'char_life', type: 'int'},
	{input_name: 'char_mana', type: 'int'},
	{input_name: 'group_point_vit', type: 'radio'},
	{input_name: 'group_point_clar', type: 'radio'},
	{input_name: 'group_point_prec', type: 'radio'},
	{input_name: 'group_anger', type: 'radio'},
	{input_name: 'group_hatred', type: 'radio'},
	{input_name: 'group_wrath', type: 'radio'},
	{input_name: 'group_pride', type: 'radio'},
	{input_name: 'group_malev', type: 'radio'},
	{input_name: 'group_zeal', type: 'radio'},
	{input_name: 'group_determ', type: 'radio'},
	{input_name: 'group_discipline', type: 'radio'},
	{input_name: 'group_grace', type: 'radio'},
	{input_name: 'group_haste', type: 'radio'},
	{input_name: 'group_purele', type: 'radio'},
	{input_name: 'group_purfire', type: 'radio'},
	{input_name: 'group_purice', type: 'radio'},
	{input_name: 'group_purlight', type: 'radio'},
	{input_name: 'bm_lvl', type: 'radio'},
	{input_name: 'level_vit', type: 'radio'},
	{input_name: 'level_clar', type: 'radio'},
	{input_name: 'level_prec', type: 'radio'},
	{input_name: 'cluster_pure_aptitude', type: 'radio'},
	{input_name: 'cluster_pure_guile', type: 'radio'},
	{input_name: 'cluster_pure_might', type: 'radio'},
	{input_name: 'cluster_self_control', type: 'radio'},
	{input_name: 'cluster_sublime_form', type: 'radio'},
	{input_name: 'cluster_uncompromising', type: 'radio'},
	{input_name: 'item_jew_implrmr', type: 'radio'},
	{input_name: 'group_heraldash', type: 'radio'},
	{input_name: 'group_heraldice', type: 'radio'},
	{input_name: 'group_heraldthunder', type: 'radio'},
	{input_name: 'group_heraldpurity', type: 'radio'},
	{input_name: 'group_heraldagony', type: 'radio'},
	{input_name: 'save', type: 'ignore'},
];

g_RadioOptions = ['off', 'mana', 'bm', 'pg'];

function saveToUrl() {
	// Check if all inputs are handled in some way
	var Inputs = $$('input');
	for(var Input of Inputs) {
		var isFound = false;
		for(var ExportField of g_ExportFields) {
			if(ExportField.input_name == Input.name) {
				isFound = true;
			}
		}
		if(!isFound) {
			alert(`Input is not handled: ${Input.name} - save/load won't work reliably!`);
		}
	}

	// Now gather the data in predefined order
	var DataBitfield = [];
	var IntVals = [];
	var RadioVals = [];
	for(var ExportField of g_ExportFields) {
		var Inputs = $$(`input[name=${ExportField.input_name}]`);
		if(ExportField.type == 'checkbox') {
			if(Inputs[0].checked) {
				DataBitfield.push(1);
			}
			else {
				DataBitfield.push(0);
			}
		}
		else if(ExportField.type == 'int') {
			var Val = parseInt(Inputs[0].value);
			if(Val == 0) {
				DataBitfield.push(0);
			}
			else {
				DataBitfield.push(1);
				IntVals.push(Val);
			}
		}
		else if(ExportField.type == 'radio') {
			if(Inputs[0].type == 'radio') {
				for(var Input of Inputs) {
					if(Input.checked) {
						if(Input.value == 'off') {
							DataBitfield.push(0);
						}
						else {
							DataBitfield.push(1);
							RadioVals.push(g_RadioOptions.indexOf(Input.value));
						}
						break;
					}
				}
			}
			else {
				// Just an uint8
				if(Inputs[0].value == 0) {
					DataBitfield.push(0);
				}
				else {
					DataBitfield.push(1);
					RadioVals.push(Inputs[0].value);
				}
				break;
			}
		}
	}
	// console.log('IntVals');
	// console.log(IntVals);
	// console.log('RadioVals');
	// console.log(RadioVals);

	// Convert to binary
	DataBitfield = bitsToBytes(DataBitfield);
	IntVals = new Int16Array(IntVals);
	RadioVals = new Uint8Array(RadioVals);

	var Version = 1;
	var Header = new Uint8Array([Version, DataBitfield.byteLength]);
	var Merged = mergeArrays([Header, DataBitfield, IntVals, RadioVals]);
	// console.log('Merged');
	// console.log(Merged);

	// Encode in url-safe base64
	var Encoded = btoa(Merged).replace(/\+/g, '-').replace(/\//g, '_');
	// console.log(Encoded);
	history.pushState({}, document.title, '#/' + Encoded);
}

function loadFromUrl() {
	return;
	try {
		var Encoded = window.location.hash;
		if(Encoded == '') {
			// Nothing here
			return;
		}
		if(!Encoded.startsWith('#/')) {
			// TODO throw
		}
		Encoded = Encoded.substr(2);
		Encoded.replace(/\-/g, '+').replace(/\_/g, '\/');

		var Merged = atob(Encoded);
		var Offs = 0;
		var Version = Merged[Offs];
		Offs += 1;
		if(Version == 1) {
			// Read header
			var [DataBitfieldLength] = Merged.slice(Offs, 1);
			Offs += 1;

			// Read bitfield
			var DataBitfield = Merged.slice(Offs, DataBitfieldLength);
			Offs += DataBitfieldLength;
			DataBitfield = bytesToBits(DataBitfield);

			// Read vals.
			// Due to tailing zeros, this may be shorter than list of controls
			for(var BitIdx in DataBitfield) {
				var Bit = DataBitfield[BitIdx];
				var ExportField = g_ExportFields(BitIdx);
				if(Bit) {
					if(ExportField.type == 'checkbox') {
						document.calc[ExportField.input_name].checked = (Bit == 1);
					}
					else if(ExportField.type == 'int') {
						var Value = (new Uint16Array((Merged.slice(Offs, 2)).buffer))[0];
						Offs += 2;
						document.calc[ExportField.input_name].value = Value;
					}
					else if(ExportField.type == 'radio') {
						var Value = Merged.slice(Offs, 1)[0];
						Offs += 1;
						document.calc[ExportField.input_name].value = g_RadioOptions[Value];
					}
				}
			}

			// TODO: Everything was read without exception - fill the form
		}
		else {
			// TODO throw
		}
	}
	catch(Exc) {
		// TODO error reporting, reload page without url?
	}
}

function calcMain() {
	initUiPassives();
	initUiClusters();
	initUiAuraPoints();
	initUiAuraPercent('Offence', ['anger', 'hatred', 'wrath', 'pride', 'malev', 'zeal']);
	initUiAuraPercent('Defence', ['determ', 'discipline', 'grace', 'haste', 'purele', 'purfire', 'purice', 'purlight']);
	initUiAuraPercent('Heralds', ['heraldash', 'heraldice', 'heraldthunder', 'heraldpurity', 'heraldagony']);

	// Get all RMR inventory/passive inputs
	var Inputs = $$('input[name^="passive_"]');
	for(var i = 0; i < Inputs.length; ++i) {
		g_RmrInputs.push(Inputs[i]);
	}
	var Inputs = $$('input[name^="item_"]');
	for(var i = 0; i < Inputs.length; ++i) {
		g_RmrInputs.push(Inputs[i]);
	}

	makeSensitiveToChange(g_RmrInputs);
	makeSensitiveToChange($$('input[name^="group_"'));
	makeSensitiveToChange($$('input[name^="group_point_"'));
	makeSensitiveToChange($$('input[name^="cluster_"]'));
	makeSensitiveToChange($$('input[name^="char_"]'));
	makeSensitiveToChange($$('input[name="bm_lvl"]'));
	makeSensitiveToChange($$('input[name="bm_qty"]'));
	makeSensitiveToChange($$('input[name^="level_"]'));

	document.settings.hide_disabled.onchange = toggleDisabledVisibility;
	document.settings.save.onclick = saveToUrl;

	loadFromUrl();
	recalcReserved();
}

window.addEventListener("load", calcMain);
