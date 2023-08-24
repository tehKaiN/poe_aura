//------------------------------------------------------------------------- UTIL

$ = function(x) {return document.querySelector(x);};
$$ = function(x) {return document.querySelectorAll(x);};

function bitsToBytes(Bits) {
	// Expand array to have round amount of bits, fill with zeros
	let Expanded = [...Bits];
	while(Expanded.length % 8 != 0) {
		Expanded.push(0);
	}

	// Pack to bytes
	let Bytes = new Uint8Array(Expanded.length / 8);
	let BytePos = 0;
	let BitPos = 0;
	for(let Bit of Expanded) {
		Bytes[BytePos] = (Bytes[BytePos] << 1) | Bit;
		if(++BitPos == 8) {
			BitPos = 0;
			++BytePos;
		}
	}
	return Bytes;
}

function bytesToBits(Bytes) {
	let Bits = [];
	for(let Byte of Bytes) {
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
	let TotalLength = 0;
	for(let Arr of Arrays) {
		TotalLength += Arr.byteLength;
		console.log('addlength: ' + Arr.byteLength);
	}

	let Out = new Uint8Array(TotalLength);
	let Offs = 0;
	for(Arr of Arrays) {
		Out.set(Arr, Offs);
		Offs += Arr.byteLength;
	}
	return Out;
}

//------------------------------------------------------------------------- MAIN

g_ReffInputs = [];

g_AurasPercent = {
	'anger': {name: "Anger", icon: 'aurafire', effect: 'Fire dmg', resvd: 50},
	'determ': {name: "Determination", icon: 'auraarmour', effect: 'Armour', resvd: 50},
	'discipline': {name: "Discipline", icon: 'auraenergy', effect: 'Ene shield', resvd: 35},
	'grace': {name: "Grace", icon: 'auraevasion', effect: 'Evasion', resvd: 50},
	'haste': {name: "Haste", icon: 'auraspeed', effect: 'Speed', resvd: 50},
	'hatred': {name: "Hatred", icon: 'auracold', effect: 'Cold dmg', resvd: 50},
	'malev': {name: "Malevolence", icon: 'DeliriumAura', effect: 'DoT, skill dur', resvd: 50},
	'pride': {name: "Pride", icon: 'auradamage', effect: 'Phys dmg', resvd: 50},
	'purele': {name: "Purity of Elements", icon: 'auraresist', effect: 'Res', resvd: 50},
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
	'aspectavian': {name: "Aspect of the Avian", icon: 'AvianAspect', effect: 'Dmg/speed', resvd: 25},
	'aspectcat': {name: "Aspect of the Cat", icon: 'CatAspect', effect: 'Crit/stealth/speed', resvd: 25},
	'aspectcrab': {name: "Aspect of the Crab", icon: 'CrabAspect', effect: 'Dmg reduction', resvd: 25},
	'aspectspider': {name: "Aspect of the Spider", icon: 'SpiderAspect', effect: 'Hinder', resvd: 25},
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
	220, 219, 218, 217, 216, 215, 214, 213, 212, 211,
	210, 209, 208, 207, 206, 205, 204, 203, 202, 201,
	200, 199, 198, 197, 196, 195, 194, 193, 192, 191,
	191, 190, 190, 189, 189, 188, 188, 187, 187, 186
];

g_Passives = {
	'sov': {name: 'Sovereignty', reff: [8, 8, 12], icon: 'sovereignty'},
	'lead': {name: 'Leadership', reff: [8], icon: 'leadership'},
	'infl': {name: 'Influence', reff: [8], icon: 'influence'},
	'char': {name: 'Charisma', reff: [8, 16], icon: 'authority'},
	'cotc': {name: 'Champion of the Cause', reff: [8], icon: 'Champion'},
	'thought': {name: 'Sanctuary of Thought', reff: [25], icon: 'MindOverBeing'}
};

g_Clusters = {
	destructive_aspect: {name: 'Destructive Aspect', affects: 'pride', reff: 50, icon: 'AuraEffectNotable'},
	electric_presence: {name: 'Electric Presence', affects: 'wrath', reff: 50, icon: 'AuraEffectNotable'},
	frantic_presence: {name: 'Frantic Aspect', affects: 'haste', reff: 50, icon: 'AuraEffectNotable'},
	// TODO: forbidden words: curse auras
	// TODO: master of command: banners
	mortifying_aspect: {name: 'Mortifying Aspect', affects: 'malev', reff: 50, icon: 'AuraEffectNotable'},
	pure_aptitude: {name: 'Pure Aptitude', affects: 'purlight', reff: 80, icon: 'LightningResistNotable'},
	pure_guile: {name: 'Pure Guile', affects: 'purice', reff: 80, icon: 'ColdResistNotable'},
	pure_might: {name: 'Pure Might', affects: 'purfire', reff: 80, icon: 'FireResistNotable'},
	righteous_path: {name: 'Righteous Path', affects: 'zeal', reff: 50, icon: 'AuraEffectNotable'},
	self_control: {name: 'Self-Control', affects: 'discipline', reff: 80, icon: 'EnergyShieldNotable'},
	spiteful_presence: {name: 'Spiteful Presence', affects: 'hatred', reff: 50, icon: 'AuraEffectNotable'},
	sublime_form: {name: 'Sublime Form', affects: 'grace', reff: 50, icon: 'EvasionNotable'},
	uncompromising: {name: 'Uncompromising', affects: 'determ', reff: 50, icon: 'ArmourNotable'},
	volatile_presence: {name: 'Volatile Presence', affects: 'anger', reff: 50, icon: 'AuraEffectNotable'},
};

function getReffFromClustersForAura(AuraCodeName) {
	let Reff = 0;
	for(let ClusterCode in g_Clusters) {
		let Cluster = g_Clusters[ClusterCode];
		if(Cluster.affects == AuraCodeName) {
			// Check how many clusters are enabled
			Reff += Cluster.reff * parseInt(document.calc['cluster_' + ClusterCode].value);
		}
	}
	return Reff;
}

function recalcReserved() {
	// Calc mask of the tribunal
	let MaskRoll = 25;
	let Attribs = (
		parseInt(document.calc.char_str.value) +
		parseInt(document.calc.char_dex.value) +
		parseInt(document.calc.char_int.value) + 3 * MaskRoll
	);
	let ReffTribunal = 2 * Math.floor(Attribs / 250);
	$('#option_tribunal').dataset.reffMax = ReffTribunal;
	$('#option_tribunal').dataset.reffMin = ReffTribunal;
	$('#option_tribunal').innerHTML = `Mask of the Tribunal (${ReffTribunal})`;

	// Calc global Reff
	let ReffChar = 0;
	for(let i = 0; i < g_ReffInputs.length; ++i) {
		let Input = g_ReffInputs[i];
		let ReffInput = 0;
		if(Input.type == 'checkbox') {
			if(Input.checked) {
				ReffInput = parseInt(Input.value);
			}
		}
		else {
			ReffInput = parseInt(Input.value);
		}
		if(isNaN(ReffInput)) {
			ReffInput = 0;
		}
		ReffChar += ReffInput;
	}
	$('#reff_total').innerHTML = `Tree + inventory Reservation Efficiency: ${ReffChar}%`;

	// Blood magic multiplier
	let BloodMagicMult = g_BloodMagic[document.calc.bm_lvl.value];
	$('#bm_mana_mult').innerHTML = `Multiplier: ${BloodMagicMult}%`;

	// Calc reservation
	let TotalLife = parseInt(document.calc.char_life.value);
	let TotalMana = parseInt(document.calc.char_mana.value);
	let ReservedManaPoints = 0;
	let ReservedLifePoints = 0;
	let AurasEnabled = 0;
	for(let AuraName in  g_AurasPercent) {
		let AuraDef = g_AurasPercent[AuraName];
		let InputGroup = document.calc['group_' + AuraName];
		let ElementReserved = $(`#reserved_${AuraName}`);
		if(InputGroup.value != 'off') {
			++AurasEnabled;
			let ManaMultiplier = 100;
			let Reff = ReffChar;
			let isLife = false;
			if(InputGroup.value == 'pg') {
				// Prism guardian
				Reff += 25;
				isLife = true;
			}
			else if(InputGroup.value == 'bm') {
				// Blood magic
				ManaMultiplier *= BloodMagicMult / 100;
				isLife = true;
				if(document.calc.bm_qty.checked) {
					Reff += 1;
				}
			}
			else if(InputGroup.value == 'ml') {
				// March of the Legion
				ManaMultiplier = 0;
			}
			Reff += getReffFromClustersForAura(AuraName);
			let ReservedPercentForThisAura = Math.ceil(AuraDef.resvd * (ManaMultiplier / 100) / ((100 + Reff) / 100));
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

	let FreeLife = TotalLife - ReservedLifePoints;
	let FreeMana = TotalMana - ReservedManaPoints;
	let ReservedLifePercent = Math.ceil((ReservedLifePoints / TotalLife) * 1000) / 10;
	let ReservedManaPercent = Math.ceil((ReservedManaPoints / TotalMana) * 1000) / 10;
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
	for(let AuraName in g_AurasPoints) {
		let AuraDef = g_AurasPoints[AuraName];
		let InputGroup = document.calc[`group_point_${AuraName}`];
		let ElementReserved = $(`#reserved_point_${AuraName}`);
		if(InputGroup.value != 'off') {
			++AurasEnabled;
			let ManaMultiplier = 100;
			let Reff = ReffChar;
			let isLife = false;
			if(InputGroup.value == 'pg') {
				// Prism guardian
				Reff += 25;
				isLife = true;
			}
			else if(InputGroup.value == 'bm') {
				// Blood magic
				ManaMultiplier *= BloodMagicMult / 100;
				isLife = true;
			}
			else if(InputGroup.value == 'ml') {
				// March of the Legion
				ManaMultiplier = 0;
			}

			let ElementLevel = document.calc[`level_${AuraName}`];
			let BaseReserved = AuraDef.resvd[ElementLevel.value];
			$(`#rsvd_${AuraName}`).innerHTML = BaseReserved;
			let ReservedPointsForThisAura = Math.round(BaseReserved * (ManaMultiplier / 100) / ((100 + Reff) / 100));
			let ReservedPercentForThisAura;
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
	let FreeLifePercent = Math.floor(FreeLife / TotalLife * 1000) / 10;
	let FreeManaPercent = Math.floor(FreeMana / TotalMana * 1000) / 10;
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
				let NewVal = parseInt(Evt.target.value) - Math.sign(Evt.deltaY);
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
	for(let PassiveCode in g_Passives) {
		let Passive = g_Passives[PassiveCode];
		let ReffString = '';
		let ReffTotal = 0;
		if (typeof(Passive.reff) == 'number') {
			Passive.reff = [Passive.reff];
		}
		for(let ReffNode of Passive.reff) {
			ReffTotal += ReffNode;
			if(ReffString.length) {
				ReffString += ' + ';
			}
			ReffString += ReffNode;
		}
		let Div = document.createElement('div');
		Div.classList.add('option');
		Div.innerHTML = `
			<label>
			<img src="img/${Passive.icon}.webp" class="icon">
			${Passive.name} (${ReffString})<input type="checkbox" name="passive_${PassiveCode}" value="${ReffTotal}">
			</label>
		`;
		$('#passive_ctl').appendChild(Div);
	}
}

function initUiClusters() {
	// Create cluster checkboxes
	for(let ClusterCode in g_Clusters) {
		let Cluster = g_Clusters[ClusterCode];
		let AffectsAura = g_AurasPercent[Cluster.affects];
		if(!AffectsAura) {
			AffectsAura = g_AurasPoints[Cluster.affects];
		}
		let AffectsName = AffectsAura.name;
		if(AffectsAura.abbr) {
			AffectsName = `<abbr title="${AffectsName}">${AffectsAura.abbr}</abbr>`;
		}
		let Div = document.createElement('div');
		Div.classList.add('option');
		Div.innerHTML = `
			<label>
			<img src="img/${Cluster.icon}.webp" class="icon">
			${Cluster.name} (${AffectsName} ${Cluster.reff}%)
			<input class="cluster" name="cluster_${ClusterCode}" value="0" min="0" max="5">
			</label>
		`;
		$('#cluster_ctl').appendChild(Div);
	}
}

function initUiAuraPoints() {
	// Point-based auras
	for(let AuraCode in g_AurasPoints) {
		let Aura = g_AurasPoints[AuraCode];
		let Row = document.createElement('tr');
		Row.innerHTML = `
			<td><img src="img/${Aura.icon}.webp" class="icon">${Aura.name}</td><td>${Aura.effect}</td>
			<td><input name="level_${AuraCode}" value="20" min="1" max="40" class="input_small"></td>
			<td id="rsvd_${AuraCode}"></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="off" checked="checked"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="helm"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="body"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="weapon"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="shield"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="gloves"></label></td>
			<td><label><input type="radio" name="group_point_${AuraCode}" value="boots"></label></td>
			<td id="reserved_point_${AuraCode}"></td>
		`;
		$('#table_aura_points').appendChild(Row);
	}
}

function initUiAuraPercent(Label, AuraCodes) {
	// Header
	let Row = document.createElement('tr');
	Row.innerHTML = `<td colspan="11" class="sep">${Label}</td>`;
	$('#table_aura_percent').appendChild(Row);

	// Auras
	for(let AuraCode of AuraCodes) {
		let Aura = g_AurasPercent[AuraCode];
		Row = document.createElement('tr');
		Row.innerHTML = `
			<td><img src="img/${Aura.icon}.webp" class="icon">${Aura.name}</td><td>${Aura.effect}</td>
			<td>${Aura.resvd}</td>
			<td><label><input type="radio" name="group_${AuraCode}" value="off" checked="checked"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="helm"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="body"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="weapon"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="shield"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="gloves"></label></td>
			<td><label><input type="radio" name="group_${AuraCode}" value="boots"></label></td>
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
	{input_name: 'eq_helmet', type: 'int'},
	{input_name: 'reff_helmet', type: 'int'},
	{input_name: 'bm_helmet', type: 'checkbox'},
	{input_name: 'en_helmet', type: 'int'},
	{input_name: 'eq_body', type: 'int'},
	{input_name: 'reff_body', type: 'int'},
	{input_name: 'bm_body', type: 'checkbox'},
	{input_name: 'en_body', type: 'int'},
	{input_name: 'eq_weapon', type: 'int'},
	{input_name: 'reff_weapon', type: 'int'},
	{input_name: 'bm_weapon', type: 'checkbox'},
	{input_name: 'en_weapon', type: 'int'},
	{input_name: 'eq_shield', type: 'int'},
	{input_name: 'reff_shield', type: 'int'},
	{input_name: 'bm_shield', type: 'checkbox'},
	{input_name: 'en_shield', type: 'int'},
	{input_name: 'eq_gloves', type: 'int'},
	{input_name: 'reff_gloves', type: 'int'},
	{input_name: 'bm_gloves', type: 'checkbox'},
	{input_name: 'en_gloves', type: 'int'},
	{input_name: 'eq_boots', type: 'int'},
	{input_name: 'reff_boots', type: 'int'},
	{input_name: 'bm_boots', type: 'checkbox'},
	{input_name: 'en_boots', type: 'int'},
	{input_name: 'eq_amulet', type: 'int'},
	{input_name: 'reff_amulet', type: 'int'},
	{input_name: 'passive_sov', type: 'checkbox'},
	{input_name: 'passive_lead', type: 'checkbox'},
	{input_name: 'passive_infl', type: 'checkbox'},
	{input_name: 'passive_char', type: 'checkbox'},
	{input_name: 'passive_cotc', type: 'checkbox'},
	{input_name: 'hide_disabled', type: 'checkbox'},
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
	{input_name: 'bm_lvl', type: 'int'},
	{input_name: 'bm_qty', type: 'checkbox'},
	{input_name: 'level_vit', type: 'radio'},
	{input_name: 'level_clar', type: 'radio'},
	{input_name: 'level_prec', type: 'radio'},
	{input_name: 'cluster_pure_aptitude', type: 'radio'},
	{input_name: 'cluster_pure_guile', type: 'radio'},
	{input_name: 'cluster_pure_might', type: 'radio'},
	{input_name: 'cluster_self_control', type: 'radio'},
	{input_name: 'cluster_sublime_form', type: 'radio'},
	{input_name: 'cluster_uncompromising', type: 'radio'},
	{input_name: 'jewel_implreff', type: 'int'},
	{input_name: 'group_heraldash', type: 'radio'},
	{input_name: 'group_heraldice', type: 'radio'},
	{input_name: 'group_heraldthunder', type: 'radio'},
	{input_name: 'group_heraldpurity', type: 'radio'},
	{input_name: 'group_heraldagony', type: 'radio'},
	{input_name: 'group_aspectavian', type: 'radio'},
	{input_name: 'group_aspectcat', type: 'radio'},
	{input_name: 'group_aspectcrab', type: 'radio'},
	{input_name: 'group_aspectspider', type: 'radio'},
	{input_name: 'save', type: 'ignore'},
];

g_RadioOptions = ['off', 'mana', 'bm', 'pg', 'ml'];

function saveToUrl() {
	// Check if all inputs are handled in some way
	let Inputs = $$('input');
	for(let Input of Inputs) {
		let isFound = false;
		for(let ExportField of g_ExportFields) {
			if(ExportField.input_name == Input.name) {
				isFound = true;
			}
		}
		if(!isFound) {
			alert(`Input is not handled: ${Input.name} - save/load won't work reliably!`);
		}
	}

	// Now gather the data in predefined order
	let DataBitfield = [];
	let IntVals = [];
	let RadioVals = [];
	for(let ExportField of g_ExportFields) {
		let Inputs = $$(`input[name=${ExportField.input_name}]`);
		if(ExportField.type == 'checkbox') {
			if(Inputs[0].checked) {
				DataBitfield.push(1);
			}
			else {
				DataBitfield.push(0);
			}
		}
		else if(ExportField.type == 'int') {
			let Val = parseInt(Inputs[0].value);
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
				for(let Input of Inputs) {
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

	let Version = 1;
	let Header = new Uint8Array([Version, DataBitfield.byteLength]);
	let Merged = mergeArrays([Header, DataBitfield, IntVals, RadioVals]);
	// console.log('Merged');
	// console.log(Merged);

	// Encode in url-safe base64
	let Encoded = btoa(Merged).replace(/\+/g, '-').replace(/\//g, '_');
	// console.log(Encoded);
	history.pushState({}, document.title, '#/' + Encoded);
}

function loadFromUrl() {
	return;
	try {
		let Encoded = window.location.hash;
		if(Encoded == '') {
			// Nothing here
			return;
		}
		if(!Encoded.startsWith('#/')) {
			// TODO throw
		}
		Encoded = Encoded.substr(2);
		Encoded.replace(/\-/g, '+').replace(/\_/g, '\/');

		let Merged = atob(Encoded);
		let Offs = 0;
		let Version = Merged[Offs];
		Offs += 1;
		if(Version == 1) {
			// Read header
			let [DataBitfieldLength] = Merged.slice(Offs, 1);
			Offs += 1;

			// Read bitfield
			let DataBitfield = Merged.slice(Offs, DataBitfieldLength);
			Offs += DataBitfieldLength;
			DataBitfield = bytesToBits(DataBitfield);

			// Read vals.
			// Due to tailing zeros, this may be shorter than list of controls
			for(let BitIdx in DataBitfield) {
				let Bit = DataBitfield[BitIdx];
				let ExportField = g_ExportFields(BitIdx);
				if(Bit) {
					if(ExportField.type == 'checkbox') {
						document.calc[ExportField.input_name].checked = (Bit == 1);
					}
					else if(ExportField.type == 'int') {
						let Value = (new Uint16Array((Merged.slice(Offs, 2)).buffer))[0];
						Offs += 2;
						document.calc[ExportField.input_name].value = Value;
					}
					else if(ExportField.type == 'radio') {
						let Value = Merged.slice(Offs, 1)[0];
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
	initUiAuraPercent('Aspects', ['aspectavian', 'aspectcat', 'aspectcrab', 'aspectspider']);

	// Get all Reff inventory/passive inputs
	let Inputs = $$('input[name^="passive_"]');
	for(let i = 0; i < Inputs.length; ++i) {
		g_ReffInputs.push(Inputs[i]);
	}
	Inputs = $$('input[name^="item_"]');
	for(let i = 0; i < Inputs.length; ++i) {
		g_ReffInputs.push(Inputs[i]);
	}
	Inputs = $$('input[name^="eq_"]');
	for(let i = 0; i < Inputs.length; ++i) {
		g_ReffInputs.push(Inputs[i]);
	}

	makeSensitiveToChange(g_ReffInputs);
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
