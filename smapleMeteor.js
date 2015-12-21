//Setup db Collections
var Schemas = {};

items = new Mongo.Collection('items');
Schemas.itemsSchema = new SimpleSchema({
	itemId: {
		type: String
		//autoValue: function(){return Meteor.userId()}
	},
	notes: {
		type: String
	}
});
items.attachSchema(Schemas.itemsSchema);
	
fields = new Mongo.Collection("fields");
Schemas.fieldsSchema = new SimpleSchema({
	item_id: {
		type: String
	},
	fieldVals: {
		type: [String],
		optional: true
	}
});
fields.attachSchema(Schemas.fieldsSchema);
	
fieldNames = new Mongo.Collection("fieldNames");
Schemas.fieldNameSchema = new SimpleSchema({
	fieldName: {
		type: String
	}
});
fieldNames.attachSchema(Schemas.fieldNameSchema);
	

if (Meteor.isServer) {
	Meteor.startup(function() {
		return Meteor.methods({
			//empty collections on startup
			emptyCollections: function() {
				items.remove({});
				fieldNames.remove({});
				return fields.remove({});
			},
			instaIdArray: function() {
				var idArray = [];
				return Session.set("idArray", idArray);
			},
			instaFieldNames: function() {
				var fieldNameArr = [];
				return Session.set("fieldNameArray", fieldNameArray)
			}
		});
	});
}

if(Meteor.isClient) {
	Template.TemplateA.helpers({
		//returns a cursor of all items to store field values for
		findItems: function() {
			return items.find({},{});
		},
		//returns a cursor of field names to append to each item
		//TODO: add item name to schema to allow different values for different items
		//      ^-- retrieve from collection elsewhere?
		fieldNames: function() {
			return fieldNames.find({},{});
		}
	});
	
	//return a field value if it was previously stored by id+field key
	UI.registerHelper('getValue', function(id, field) {
		  return Session.get(id+field);
	});

	//passes item ids into a session variable array, must update records with new instance of array (safe because Session.get returns clone of value)
	UI.registerHelper('storeId', function(item_id, options) {
		//(x && ...) checks existence before returning what's after
		  return Session.get("idArray") && Session.set("idArray", Session.get("idArray").push(item_id));
		//} 	  
	});
	
	UI.registerHelper(' Name', function(fieldName, options) {
		//(x && ...) checks existence before returning what's after
		  return Session.get("fieldNameArray") && Session.set("fieldNameArray", Session.get("fieldNameArray").push(fieldName));
		//} 	  
	});
	
	//stores field values by unique field name on key press
	Template.TemplateB.events({
		"keydown .setVal": function (event) {
			var value = $(event.target).val();
			Session.set(event.target.name, value);
		}
	});
	
	//empties all database collections (not Session storage), must be called from server
	Template.TemplateA.events({
		"reset form": function (event, template) {
			event.defaultPrevented;
			Meteor.call("emptyCollections");
		}
	});

	//iterate through fields by id from idArray (both stored in Session storage) and copy into database
	Template.TemplateA.events({
		"submit form": function (event, template) {
			event.defaultPrevented; //don't submit a form
			//can't it read from db source itself? b/c not "reactive"
			var domIds = Session.get("idArray");
			for (i = 0; i < domIds.length; i++) {
				var item_id = domIds[i];
				//get (with id) for each fieldName
				var fieldNameArray = Session.get("fieldNameArray");
				var fieldValArray = [];
				for (i = 0; j < fieldNameArray.length; j++) {
					fieldValArray.add(Session.get(item_id+fieldNameArray[j]));
					fields.insert({
						item_id: item_id,
						fieldVals: fieldValArray
					});
				}
			}
		}
	});	
}