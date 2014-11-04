<!-- =============== -->
<!-- Javascript code -->
<!-- =============== -->

// Variable that contains all the app components
var app = {};

//Define model
app.SoepModel = Backbone.Model.extend({

    defaults: {
        naam: ''

    }
});
app.DagModel=Backbone.Model.extend({

    defaults:{
        datumString:'Dinsdag 21 oktober',
        datum:'2014-10-21',
        soep1:'soep1',
        soep2:'soep2',
        soep3:'soep3',
        soep4:'soep4'
    }

});
var dag= new app.DagModel({soep1:'tomatensoep'});
console.log(dag.get('soep1'));

//Define collection
app.SoepCollection = Backbone.Collection.extend({
    model: app.SoepModel,
    url:'/backbone_soep/api/soepprogramma.php'

});
app.DagCollection=Backbone.Collection.extend({
    model: app.DagModel,
    localStorage: new Store('DagCollection')
});


//Collection instance
app.soepen = new app.SoepCollection({});
app.dagen = new app.DagCollection({});
console.log(app.dagen.pluck('datum'));
//Add new soep item to Collection
/*app.soepen.create({name:'tomatensoep'});
 console.log(app.soepen.pluck('name'));*/

app.SoepView = Backbone.View.extend({
    initialize:function(){
        this.model.on('destroy', this.remove, this);
        // remove: Convenience Backbone's function for removing the view from the DOM.

    },
    tagName: 'option',
    template: _.template($('#item-template').html()),
    render: function() {
        console.log('SoepView: Render');

        console.log(this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});
app.SoepUlView = Backbone.View.extend({
    initialize:function(){
        this.model.on('destroy', this.remove, this);
        // remove: Convenience Backbone's function for removing the view from the DOM.

    },
    tagName: 'em',
    template: Handlebars.compile($('#ul-template').html()),
    render: function() {
        console.log('SoepUlView: Render');

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});
app.DagView=Backbone.View.extend({
    tagname: 'em',
    template: Handlebars.compile($('#dag-template').html()),
    render: function() {
        console.log('dagView: Render');
        console.log(this.model.toJSON());
        //De eerste letter van de soepnaam wordt hier naar hoofdletter gezet
        for(teller=1;teller<5;teller++){
            var naarHoofdletter=this.model.get('soep'+teller);
            naarHoofdletter=naarHoofdletter.substr(0,1).toUpperCase()+(naarHoofdletter).substr(1);
            this.model.set('soep'+teller,naarHoofdletter);

        }
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});




app.SoepListView = Backbone.View.extend({
    el: '#container',
    events: {
        //'NaamEvent ElementJquery': 'Functie'
        'keypress #new-soep': 'createToDo',
        'change #soep-list': 'addToUl',
        'click #soep-ul a': 'linkSoepUlGeklikt',
        'click #dag-ul a':'linkDagUlGeklikt',
        'click #verzendSoepen':'verzendSoepen',
        'click #wisSoepen':'wisSoepen'

    },
    linkSoepUlGeklikt:function(e){
        e.preventDefault();
        var href=$(e.currentTarget).attr('id');
        console.log(href);
        var soep= app.soepen.findWhere({naam:href});
        soep.destroy();

    },
    linkDagUlGeklikt:function(e){
        e.preventDefault();
        $('#dag-ul').empty();

    },
    verzendSoepen:function(e){
        e.preventDefault();
        console.log('verzendSoepen geklikt');
        $('#dag-ul').append($('#soep-ul').children());

    },
    wisSoepen:function(){
        console.log('Wis Soepen geklikt');
        app.soepen.reset();
        console.log('app.soepen gereset');

    },

    initialize: function() {
        console.log('AppView:Initialize');
        // when new elements are added to the collection render then with addOne
        app.soepen.on('add', this.addOne, this);
        //app.soepen.on('reset',this.addAll,this);
        app.soepen.fetch();// Loads list from local storage
        this.render();



    },
    render: function() {
        console.log('AppView:Render');
        //this.$el.html('Hello World');
    },
    createToDo: function(event) {
        if(event.which !== 13 || !$(event.target).val().trim()) {
            console.log('AppView:CreateToDo:Empty or not Enter');
            return;
        }

        console.log('AppView:CreateToDo');

        //Input uitlezen
        var data = {
            naam : $(event.target).val()
        };

        //Data aan collectie toevoegen en opslaan
        app.soepen.create(data);

        //Input leegmaken
        $(event.target).val('');
        app.soepen.each(function(soep){console.log(soep.get('naam'))});
    },
    addOne: function(soep) {
        console.log('AppView:addOne');
        var view = new app.SoepView({model: soep});
        console.log('AppView:Prepared');
        $('#soep-list').append(view.render().el);
        console.log('AppView:Render Done');
    },
    addAll: function(){
        $('#soep-list').html(''); // clean the todo list
        app.soepen.each(this.addOne, this);
    },
    addToUl : function(soepSelect){
        var gekozen=$('#soep-list option:selected').val();
        soepSelect= app.soepen.findWhere({naam:gekozen});
        var view= new app.SoepUlView({model:soepSelect});
        //console.log($('#soep-list option:selected').val());

        console.log(soepSelect);
        //var html='<li><input class="toggle" type="checkbox">'+soepSelect.get('name')+'</li>';
        $('#soep-ul').append(view.render().el);



    }
});

app.DagListView=Backbone.View.extend({
    initialize: function(){
        app.dagen.fetch();


    },
    el:'#container',
    events : {
        'click #slaDagOp' : 'slaDagOp',
        'click #haalDagenOp':'haalDagenOp',
        'click #wisDagen':'wisDagen'

    },
    haalDagenOp : function(){
        console.log('Haal Dagen op geklikt');
        //console.log('voor each');
        $('#opgehaaldeDagen').empty();
        app.dagen.each(this.addOneDay,this);
        //console.log('voorbij each');
        //console.log(this.model.toJSON());
    },


    wisDagen : function(){
        console.log('Wis Dagen geklikt');
        app.dagen.reset();
        console.log('app.dagen gereset');

    },
    addOneDay: function(dag){
        var dagView=new app.DagView({model:dag});
        //dagView.render();
        $('#opgehaaldeDagen').append(dagView.render().el);

    },
    slaDagOp : function(){
        console.log('Sla Dag Op geklikt');
        //console.log($('#dag').val());
        var datumInvoer=$('#dag').val();
        var soep1=$('#dag-ul li').eq(0).text().trim();
        var soep2=$('#dag-ul li').eq(1).text().trim();
        var soep3=$('#dag-ul li').eq(2).text().trim();
        var soep4=$('#dag-ul li').eq(3).text().trim();
        console.log('datuminvoer= '+ datumInvoer );
        console.log(soep1);

        //EINDWERK VORIG JAAR____Datum omzetten naar datumString bvb 2014-10-21 wordt Dinsdag 21 oktober________

        //functie die de weekdag teruggeeft van een bepaalde datum
        //bvb : var weekdag=wichDayWasThat(18-04-2014)-> stelt weekdag gelijk aan vrijdag
        function whichDayWasThat(date) {
            this.date = date.split('-');
            days = new Array('Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag');
            myDate = new Date();
            myDate.setMonth(parseInt(this.date[1] - 1), this.date[0]); //
            myDate.setFullYear(this.date[2]);

            return (days[myDate.getDay()]);
        }

        //functie die de maandnaam teruggeeft van de meegegeven maand
        function whichMonthWasThat(month) {
            month = parseInt(month);
            months = new Array('januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober',
                'november', 'december');
            return months[month - 1];
        }

        //functie die de nul weghaalt voor dagen 01 tot 09
        function convertDay(day) {
            if ((day.substr(0, 1)) == 0) {
                day = day.substr(1, 1);
                return day;
            }
            else {
                return day;
            }
        }

        //dag, maand en jaar uit dat de datum halen en
        //terug aan elkaar plakken in het formaat dd-mm-yyyy
        var datumString = datumInvoer;
        var dag = datumString.substr(8, 2);
        var maand = datumString.substr(5, 2);
        var jaar = datumString.substr(0, 4);
        datumString = dag + '-' + maand + '-' + jaar;

        //bepalen welke weekdag het is
        var weekdag = whichDayWasThat(datumString);
        console.log(weekdag);
        //bepalen welke maand het is
        var maandnaam = whichMonthWasThat(maand);
        console.log(maandnaam);
        //dag converteren indien er een 0 voor staat
        var dag = convertDay(dag);
        console.log(dag);
        datumString = weekdag + ' ' + dag + ' ' + maandnaam;
        console.log('datumString = '+datumString);

        //____________EINDWERK VORIG JAAR______________________________________________________________


        var data=({
            datum:datumInvoer,
            datumString:datumString,
            soep1:soep1,
            soep2:soep2,
            soep3:soep3,
            soep4:soep4
        });
        //Data aan collectie toevoegen en opslaan
        app.dagen.create(data);
        console.log(app.dagen.pluck('datumString'));


        //app.dagen.each(function(dag){console.log(dag.get('datum') + dag.get('soep1')+dag.get('soep2'))});
    }

});

var soepListView = new app.SoepListView({collection: app.SoepCollection});
var dagListView =new app.DagListView({collection : app.DagCollection});
