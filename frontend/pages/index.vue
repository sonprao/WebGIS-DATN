<template>
	<el-container style="height: 1000px;">
		<el-aside>
			<Sidebar/>
		</el-aside>
		<el-main style="{height: 1000px;}">
			<!-- <GMap
				ref='gMap'
				language='en'
				:cluster='{options: {styles: clusterStyle}}'
				:center='{lat: locations[0].lat, lng: locations[0].lng}'
				:options='{fullscreenControl: false, styles: mapStyle}'
				:zoom='6'
		/> -->
		<GMap
			ref='gMap'
			language='en'
			:cluster='{options: {styles: clusterStyle}}'
			:center='{lat: locations[0].lat, lng: locations[0].lng}'
			:options="{fullscreenControl: false, styles: mapStyle, mapTypeId: 'satellite'}"
			:zoom='6'
		>
			<gmap-custom-marker
				:marker="{
					lat: locations[0].lat,
					lng: locations[0].lng
				}"
			>
				<img src="http://lorempixel.com/800/600/nature/" />
			</gmap-custom-marker>
			<GMapMarker
				v-for='location in locations'
				:key='location.id'
				:position='{lat: location.lat, lng: location.lng}'
				:options='{icon: location === currentLocation ? pins.selected : pins.notSelected}'
				@click='currentLocation = location'
			>
				<GMapInfoWindow :options='{maxWidth: 200}'>
					<code>
						lat: {{ location.lat }},
						lng: {{ location.lng }}
					</code>
				</GMapInfoWindow>
			</GMapMarker>
			<GMapCircle :options='circleOptions'/>
		</GMap>
	</el-main>
	</el-container>
</template>

<script>
// import GmapCustomMarker from 'vue2-gmap-custom-marker'
export default {
	name: 'IndexPage',
	// components: { 'gmap-custom-marker': GmapCustomMarker },
	data() {
		debugger
		const GmapCustomMarker = require('vue2-gmap-custom-marker')
		return {
			currentLocation: {},
			circleOptions: {},
			locations: [
				{
					lat: 44.933076,
					lng: 15.629058
				},
				{
					lat: 45.815,
					lng: '15.9819'
				},
				{
					lat: '45.12',
					lng: '16.21'
				}
			],
			pins: {
				selected: 'data:image/png;base64,iVBORw0KGgo...',
				notSelected: 'data:image/png;base64,iVBORw0KGgo...'
			},
			mapStyle: [],
			clusterStyle: [
				{
					url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png',
					width: 56,
					height: 56,
					textColor: '#fff'
				}
			]	
		}
	}
}
</script>
