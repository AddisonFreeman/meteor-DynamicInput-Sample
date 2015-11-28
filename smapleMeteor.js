//Setup db
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

/*in browser: items.insert {
	notes: "a candy wrentch"
}
etc... */

fields = new Mongo.Collection("fields");

Schemas.fields = new SimpleSchema({
	userId: {
		type: String
	},

	fieldA: {
		type: String,
		optional: true
	},
	fieldB: {
		type: String,
		optional: true
	},
	fieldC: {
		type: String,
		optional: true
	}
});
fields.attachSchema(Schemas.fields);

if(Meteor.isClient) {
	Template.TemplateA.helpers({
		findItems: function() {
			return items.find({},{})
		}
	});
	
	
	Template.TemplateA.events({
	"keydown .setVal": function (event) {
		var value = $(event.target).val();
		Session.set(event.target.name, value);
	}
	});
	
	Template.TemplateA.events({
		"submit .insertValues": function (event, template) {
			event.preventDefault(); //stops the page from refreshing
			console.log(event);
			var domIds = document.getElementsByClassName("item_id");
			console.log(domIds);
			for (i = 0; i < domIds.length; i++) {
				var item_id = domIds[i].value;
				var fieldA = Session.get(item_id+"fieldA");
				var fieldB = Session.get(item_id+"fieldB");
				var fieldC = Session.get(item_id+"fieldC");
			
				fields.insert({
					item_id: item_id,
					fieldA: fieldA,
					fieldB: fieldB,
					fieldC: fieldC,
				});
			//Meteor.call (addbid, postjob_id, currentUser, bid, turntim, item_ide, turn false;
			}
		}
	});
}