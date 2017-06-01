$(".year").on("change", generateMakes)
$(".make").on("change", generateModels)
$("#submit").on("click", onFormSubmit)

function returnEngineInfo(make, model, year){
	var url = "https://api.edmunds.com/api/vehicle/v2/"+make+"/"+model+"/"+year+"/styles?view=full&fmt=json&api_key=g6y8ssp8rd5zz8qp2tc74p3w"
	console.log(url)
	$.getJSON(url, function(response){
	render(filter(response))
	})
}

function onFormSubmit(event){
	event.preventDefault()
	var make = $(".make").val().toLowerCase()
	var model = $(".model").val().toLowerCase()
	var year = $(".year").val()
	returnEngineInfo(make, model, year)
}

function generateMakes(event){
	var year = $(this).find(":selected").val()
	var url = "https://api.edmunds.com/api/vehicle/v2/makes?year="+year+"&view=basic&fmt=json&api_key=g6y8ssp8rd5zz8qp2tc74p3w"
	$.getJSON(url, function(response){
		$(".make").html(function(){
			return "<option>Select Make</option>"+response.makes.map(function(make){
				return "<option data-models='"+JSON.stringify(make.models)+"'>"+make.name+"</option>"
			})
		})
	})
}

function generateModels(event){
	var models = JSON.parse($(this).find(":selected").attr("data-models"))
	$(".model").html(function(){
		return "<option>Select Model</option>"+models.map(function(model){
			return "<option>"+model.name+"</option>"
		})
	})
}

function filter(object){
	return object.styles&&object.styles.map(function(style){
		var keys =  [
			"compressionRatio",
            "cylinder",
            "size",
            "displacement",
            "configuration",
            "fuelType",
            "horsepower",
            "torque",
            "totalValves",
		]
		var importantDetails = {
			name: style.name,
			engine:{},
			colors:filterColors(style)
		}
		keys.forEach(function(key){
			if(style.engine){
			importantDetails.engine[key] = style.engine[key]				
			}
		})
		return importantDetails
	})
}

function render(filteredResponse){
	$("#results").html("")
	if(!filteredResponse.length){
		$("#results").html("No results found. Please try another model.")
	}
	for(var i=0; i<filteredResponse.length; i++){
		show(filteredResponse[i])
	}
}

function filterColors(style){
	// if(!style.colors||!(style.colors.length>1)){
	// 	return false
	// }
	var colors = {
		interior: [],
		exterior: [],
	}
	var exterior = style.colors.find(function(item){
		return item.category === "Exterior"
	})
	var interior = style.colors.find(function(item){
		return item.category === "Interior"
	})
	if(exterior){
		colors.exterior = exterior.options.map(designOptions)
		if(colors.exterior.some(color => color.hex)){
			colors.exterior = colors.exterior.filter(color => color.hex)
		}
	}	
	if(interior){
		colors.interior = interior.options.map(designOptions)
		if(colors.interior.some(color => color.hex)){
			colors.interior = colors.interior.filter(color => color.hex)
		}
	}
	return colors
}

function designOptions(color){
	return {
		name: color.name,
		// if colorChips is defined, then continue
		hex: color.colorChips&&color.colorChips.primary.hex,
		material: (color.fabricTypes || []).map(function(type){
			return type.value
		})
	}
}

function show(object){
	var interiorOptions = object.colors&&object.colors.interior.map(function(color){
		if(color.hex){
		return `<li>
					<div id='colorSwatch' style="background-color: #${color.hex}"><span>${color.name} ${color.material.join(", ")}</span></div>
				</li>`
		}
		return `<li>${color.name} ${color.material.join(", ")}
				</li>`
	}).join(" ")
	var exteriorColors = object.colors&&object.colors.exterior.map(function(color, i){
		if(color.hex){
		return `<li><div id='colorSwatch' style="background-color: #${color.hex}"><span>${color.name}</span></div></li>`
		}
		return `<li>${color.name}</li>`
	}).join(" ")

	$("#results").append(`<div id='engineType'>
		<h2>Trim Level: ${object.name}</h2>
			<ul>
				<li>Compression Ratio: ${object.engine.compressionRatio ? object.engine.compressionRatio : "Not Available"}</li>
				<li>Cylinders: ${object.engine.cylinder ? object.engine.cylinder : "Not Available"}</li>
				<li>Size: ${object.engine.size ? object.engine.size : "Not Available"}</li>
				<li>Displacement: ${object.engine.displacement ? object.engine.displacement : "Not Available"}</li>
				<li>Configuration: ${object.engine.configuration ? object.engine.configuration : "Not Available"}</li>
				<li>Fuel Type: ${object.engine.fuelType ? object.engine.fuelType : "Not Available"}</li>
				<li>horsepower: ${object.engine.horsepower ? object.engine.horsepower : "Not Available"}</li>
				<li>torque: ${object.engine.torque ? object.engine.torque : "Not Available"}</li>
				<li>Total Valves: ${object.engine.totalValves ? object.engine.totalValves : "Not Available"}</li>
			</ul>
			<div id='exteriorColorOptions'>
				<h3>Color Options:</h3> 
					<ul class="colorList">${exteriorColors}</ul>
			</div>
			<div id='interiorTypeOptions'>
				<h3>Interior Options:</h3>
					<ul class="colorList">${interiorOptions}</ul>
			</div>
		</div>`)
	// calculate the width for all the colors so they sit there evenly
	// whenever you mouse over something, the width is recalculated (ln 170ish)
	// we wont know if its -2 or -3 unless we are hovering over the end or not
	$(".colorList").each(function(){
		var $all = $(this).children()
		$all.css("width", (100/$all.length)+"%")
	})

	$(".colorList").on("mousemove", function(event){
		var target = $(event.target)
		var index = $(this).children().index(target.parent())
		var $all = $(this).children()
		console.log(target)
		if($all.length==1){
			$all.css("width", "100%")
		}
		if($all.length==3){
			console.log("here")
			console.log($all.length)
			$all.css("width", (50/($all.length-1))+"%")
			$all.eq(index).css("width", "50%")
			return
		}
		if((target).hasClass("colorList")){
			$all.eq(-1).css("width", "40%")
			$all.eq(-2).css("width", "30%")
			//hovering over whole list, but not a particular element
		}
		else{
			var elementsLeft = $all.length - 2
    		var othersWidth = ((30 / elementsLeft)) + "%"
   			$all.css('width', othersWidth)
			if(index===0){
			$(this).children().eq(index+1).css("width", "30%")			
			$(this).children().eq(index).css("width", "40%")
			}
			//if we are hovering over the first one, then the width of the first one is gonna be 40, 2nd 30, and all the rest are going to total 30%
			else if(index===$(this).children().length-1){
			$(this).children().eq(index-1).css("width", "30%")
			$(this).children().eq(index).css("width", "40%")
			}
			else{
				var elementsLeft = $all.length - 3
    			var othersWidth = ((30 / elementsLeft)) + "%"
   				$all.css('width', othersWidth)
				$(this).children().eq(index+1).css("width", "15%")
				$(this).children().eq(index-1).css("width", "15%")
				$(this).children().eq(index).css("width", "40%")
			//width of current will be 40, left and right will be 15 each, remainder will total 30
			}
		}
	})
	$(".colorList").hover(function(){}, function(){
		var $all = $(this).children()
		$all.each(function(){
			$(this).css("width", (100/$all.length)+"%")
		})
	})
}